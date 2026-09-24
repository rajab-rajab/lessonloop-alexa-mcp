import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { lessons, grade } from './curriculum.mjs';
import { protocolVersion, tools, mcpResponse, mcpError, toolResult } from './mcp.mjs';
import { explainWithBedrock } from './bedrock.mjs';
import { exportProgressToS3 } from './s3-report.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

function send(res, code, data) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}
function summary(session) {
  const lesson = lessons[session.lessonIndex];
  return { id: session.id, learner: session.learner, lessonId: lesson.id,
    lessonTitle: lesson.title, objective: lesson.objective, source: lesson.source,
    attempts: session.attempts, hints: session.hints, correct: session.correct,
    status: session.correct ? 'Completed' : session.attempts ? 'Needs practice' : 'In progress',
    nextStep: session.correct ? (lessons[session.lessonIndex + 1]?.title || 'Review the lessons') : 'Try another example with a hint' };
}
async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 12000) throw new Error('Request too large');
  }
  return JSON.parse(raw || '{}');
}
export function createServer({ dataFile = process.env.LESSONLOOP_DATA_FILE || join(root, 'data', 'sessions.json') } = {}) {
  let saved = [];
  if (existsSync(dataFile)) {
    try { const parsed = JSON.parse(readFileSync(dataFile, 'utf8')); if (Array.isArray(parsed)) saved = parsed; }
    catch { throw new Error(`Cannot read saved sessions: ${dataFile}`); }
  }
  const sessions = new Map(saved.filter(s => s && typeof s.id === 'string' && lessons[s.lessonIndex]).map(s => [s.id, s]));
  function persist() {
    mkdirSync(dirname(dataFile), { recursive: true });
    const temporary = `${dataFile}.tmp`;
    writeFileSync(temporary, JSON.stringify([...sessions.values()], null, 2));
    renameSync(temporary, dataFile);
  }
  function startLesson(input) {
    const index = lessons.findIndex(lesson => lesson.id === input.lessonId);
    if (index < 0) throw new Error('Choose a listed lesson.');
    const learner = String(input.learner || 'Learner').trim().slice(0, 40) || 'Learner';
    const session = { id: randomUUID(), learner, lessonIndex: index, attempts: 0, hints: 0, correct: false };
    sessions.set(session.id, session); persist();
    const lesson = lessons[index];
    return { session: summary(session), speech: `Hello ${learner}. ${lesson.explanation} Here is your question: ${lesson.question}`, question: lesson.question };
  }
  function findSession(id) {
    const session = sessions.get(id);
    if (!session) throw new Error('Session not found. Start a new lesson.');
    return session;
  }
  function hint(id) {
    const session = findSession(id);
    const lesson = lessons[session.lessonIndex];
    session.hints++; persist();
    return { session: summary(session), speech: lesson.hints[Math.min(session.hints - 1, lesson.hints.length - 1)] };
  }
  function answer(id, input) {
    const session = findSession(id);
    const lesson = lessons[session.lessonIndex];
    const response = String(input || '').trim().slice(0, 200);
    if (!response) throw new Error('Enter an answer first.');
    if (session.correct) return { session: summary(session), speech: 'You completed this lesson. Choose another lesson to continue.' };
    session.attempts++;
    session.correct = grade(lesson, response); persist();
    return { session: summary(session), speech: session.correct
      ? `Correct. ${lesson.explanationAfter} Your next step is ${summary(session).nextStep}.`
      : session.attempts >= 2 ? `Good effort. ${lesson.explanationAfter} Try the question again.` : 'Not quite. Ask for a hint or try again.' };
  }
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/mcp') {
        const origin = req.headers.origin;
        if (origin && !['http://localhost:' + req.socket.localPort, 'http://127.0.0.1:' + req.socket.localPort].includes(origin)) return send(res, 403, mcpError(null, -32600, 'Forbidden origin'));
        if (req.method === 'GET') {
          if (String(req.headers.accept || '').includes('text/html')) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
            return res.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>LessonLoop MCP</title><style>body{font:16px system-ui;max-width:720px;margin:10vh auto;padding:24px;background:#102019;color:#e7f4e0}code{color:#b7e49d}</style><h1>LessonLoop MCP is running</h1><p>This address serves MCP requests using HTTP POST. Opening it in a browser sends GET, which shows this status page.</p><p>Connect a compatible MCP client to <code>http://127.0.0.1:' + req.socket.localPort + '/mcp</code>. Open the <a style="color:#b7e49d" href="/">learner app</a> to use the web interface.</p><p>See README.md for a PowerShell test request. This server runs locally and does not connect to an Alexa account.</p></html>');
          }
          res.writeHead(405, { allow: 'POST' }); return res.end();
        }
        if (req.method === 'DELETE') { res.writeHead(405, { allow: 'POST' }); return res.end(); }
        if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST' }); return res.end(); }
        if (!String(req.headers.accept || '').includes('application/json') || !String(req.headers.accept || '').includes('text/event-stream')) return send(res, 406, mcpError(null, -32600, 'Accept must include JSON and event-stream'));
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, mcpError(null, -32600, 'Expected JSON'));
        const rpc = await body(req);
        if (rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string' || Array.isArray(rpc)) return send(res, 400, mcpError(rpc.id ?? null, -32600, 'Invalid JSON-RPC request'));
        if (rpc.method !== 'initialize' && req.headers['mcp-protocol-version'] !== protocolVersion) return send(res, 400, mcpError(rpc.id ?? null, -32602, 'Unsupported protocol version'));
        if (!Object.hasOwn(rpc, 'id')) { res.writeHead(202); return res.end(); }
        if (rpc.method === 'initialize') return send(res, 200, mcpResponse(rpc.id, { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'lessonloop', version: '0.3.0' }, instructions: 'Only locally defined lesson content is authoritative. Use start_lesson, get_hint, submit_answer, and get_progress to guide one learner. Ask the learner before recording a name or answer.' }));
        if (rpc.method === 'ping') return send(res, 200, mcpResponse(rpc.id, {}));
        if (rpc.method === 'tools/list') return send(res, 200, mcpResponse(rpc.id, { tools }));
        if (rpc.method !== 'tools/call') return send(res, 200, mcpError(rpc.id, -32601, 'Method not found'));
        const name = rpc.params?.name, args = rpc.params?.arguments ?? {};
        if (!tools.some(tool => tool.name === name)) return send(res, 200, mcpError(rpc.id, -32602, 'Unknown tool'));
        if (!args || typeof args !== 'object' || Array.isArray(args)) return send(res, 200, mcpError(rpc.id, -32602, 'Invalid arguments'));
        try {
          let result;
          switch (name) {
            case 'list_lessons': result = lessons.map(({ id, title, objective }) => ({ id, title, objective })); break;
            case 'start_lesson': result = startLesson(args); break;
            case 'get_hint': result = hint(args.sessionId); break;
            case 'submit_answer': result = answer(args.sessionId, args.answer); break;
            case 'get_progress': { const session = findSession(args.sessionId); result = { session: summary(session), question: lessons[session.lessonIndex].question }; break; }
            case 'explain_with_bedrock': { const session = findSession(args.sessionId); result = await explainWithBedrock({ lessonId: lessons[session.lessonIndex].id, answer: args.answer }); break; }
            case 'export_progress_to_s3': result = await exportProgressToS3({ sessions: [...sessions.values()] }); break;
          }
          return send(res, 200, mcpResponse(rpc.id, toolResult(result)));
        } catch (error) { return send(res, 200, mcpResponse(rpc.id, toolResult({ error: error.message }, true))); }
      }
      if (req.method === 'GET' && url.pathname === '/api/lessons') {
        return send(res, 200, lessons.map(({ id, title, level, objective }) => ({ id, title, level, objective })));
      }
      if (req.method === 'GET' && url.pathname === '/api/features') {
        return send(res, 200, { bedrock: Boolean(process.env.AWS_REGION && process.env.LESSONLOOP_BEDROCK_MODEL_ID), s3: Boolean(process.env.AWS_REGION && process.env.LESSONLOOP_S3_BUCKET) });
      }
      if (req.method === 'GET' && url.pathname === '/api/sessions') {
        return send(res, 200, [...sessions.values()].map(summary));
      }
      if (req.method === 'POST' && url.pathname === '/api/sessions') {
        const input = await body(req);
        if (!lessons.some(lesson => lesson.id === input.lessonId)) return send(res, 400, { error: 'Choose a listed lesson.' });
        return send(res, 201, startLesson(input));
      }
      if (req.method === 'POST' && url.pathname === '/api/exports/s3') {
        try { return send(res, 200, await exportProgressToS3({ sessions: [...sessions.values()] })); }
        catch (error) { return send(res, 503, { error: `S3 export unavailable: ${error.message}` }); }
      }
      const match = url.pathname.match(/^\/api\/sessions\/([0-9a-f-]+)(?:\/(answer|hint))?$/);
      if (match) {
        const session = sessions.get(match[1]);
        if (!session) return send(res, 404, { error: 'Session not found. Start a new lesson.' });
        const lesson = lessons[session.lessonIndex];
        if (req.method === 'GET' && !match[2]) return send(res, 200, { session: summary(session), question: lesson.question });
        if (req.method === 'POST' && match[2] === 'hint') {
          return send(res, 200, hint(session.id));
        }
        if (req.method === 'POST' && match[2] === 'answer') {
          const input = await body(req);
          if (!String(input.answer || '').trim()) return send(res, 400, { error: 'Enter an answer first.' });
          return send(res, 200, answer(session.id, input.answer));
        }
      }
      const coachMatch = url.pathname.match(/^\/api\/sessions\/([0-9a-f-]+)\/coach$/);
      if (req.method === 'POST' && coachMatch) {
        const session = sessions.get(coachMatch[1]);
        if (!session) return send(res, 404, { error: 'Session not found. Start a new lesson.' });
        const input = await body(req);
        if (!String(input.answer || '').trim()) return send(res, 400, { error: 'Enter an answer first.' });
        try { return send(res, 200, await explainWithBedrock({ lessonId: lessons[session.lessonIndex].id, answer: input.answer })); }
        catch (error) { return send(res, 503, { error: `AWS coaching unavailable: ${error.message}` }); }
      }
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/app.js' || url.pathname === '/style.css')) {
        const filename = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
        const type = filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html';
        res.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
        return res.end(await readFile(join(root, 'public', filename)));
      }
      send(res, 404, { error: 'Not found' });
    } catch (error) { send(res, error instanceof SyntaxError || error.message === 'Request too large' ? 400 : 500, { error: error instanceof SyntaxError ? 'Invalid JSON' : error.message }); }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  createServer().listen(port, '127.0.0.1', () => console.log(`LessonLoop: http://127.0.0.1:${port}`));
}
