import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from '../server.mjs';

test('MCP initialization and a complete tutoring tool sequence', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lessonloop-mcp-'));
  const server = createServer({ dataFile: join(dir, 'sessions.json') }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/mcp`;
  const post = async (method, params = {}, extra = {}) => {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2025-11-25', ...extra }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
    return { code: response.status, data: await response.json() };
  };
  try {
    assert.equal((await post('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '1' } })).data.result.protocolVersion, '2025-11-25');
    assert.equal((await post('tools/list')).data.result.tools.length, 5);
    const call = async (name, args) => {
      const result = (await post('tools/call', { name, arguments: args })).data.result;
      assert.equal(result.isError, false);
      return JSON.parse(result.content[0].text);
    };
    const created = await call('start_lesson', { learner: 'Ayesha', lessonId: 'variables' });
    const id = created.session.id;
    assert.equal((await call('get_hint', { sessionId: id })).session.hints, 1);
    assert.equal((await call('submit_answer', { sessionId: id, answer: '5' })).session.status, 'Completed');
    assert.equal((await call('get_progress', { sessionId: id })).session.attempts, 1);
    assert.equal((await post('tools/call', { name: 'get_progress', arguments: { sessionId: 'missing' } })).data.result.isError, true);
    assert.equal((await post('tools/list', {}, { origin: 'https://example.com' })).code, 403);
    assert.equal((await post('tools/list', {}, { 'mcp-protocol-version': 'unknown' })).code, 400);
    const browser = await fetch(url, { headers: { accept: 'text/html' } });
    assert.equal(browser.status, 200);
    assert.match(await browser.text(), /LessonLoop MCP is running/);
    const stream = await fetch(url, { headers: { accept: 'text/event-stream' } });
    assert.equal(stream.status, 405);
  } finally { await new Promise(resolve => server.close(resolve)); rmSync(dir, { recursive: true, force: true }); }
});
