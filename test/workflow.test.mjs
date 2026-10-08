import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('learner retry, hints, and teacher progress stay in sync', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lessonloop-'));
  const dataFile = join(directory, 'sessions.json');
  const server = createServer({ dataFile }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, payload) => {
    const res = await fetch(url + path, { method: payload ? 'POST' : 'GET', headers: {'content-type':'application/json'}, body: payload ? JSON.stringify(payload) : undefined });
    return { status: res.status, data: await res.json() };
  };
  try {
    assert.equal((await call('/api/lessons')).data.length, 9);
    const created = await call('/api/sessions', { learner: 'Ayesha', lessonId: 'variables' });
    assert.equal(created.status, 201);
    const id = created.data.session.id;
    const hint = await call(`/api/sessions/${id}/hint`, {});
    assert.equal(hint.data.session.hints, 1);
    const wrong = await call(`/api/sessions/${id}/answer`, { answer: '4' });
    assert.equal(wrong.data.session.status, 'Needs practice');
    const right = await call(`/api/sessions/${id}/answer`, { answer: '5' });
    assert.equal(right.data.session.status, 'Completed');
    assert.equal(right.data.session.attempts, 2);
    assert.equal(right.data.session.mastery, 'Developing');
    assert.equal(right.data.session.nextStep, 'Python variables · Practice');
    const reloaded = await call(`/api/sessions/${id}`);
    assert.equal(reloaded.data.session.correct, true);
    assert.equal((await call('/api/sessions')).data.length, 1);
    assert.equal((await call('/api/sessions', { lessonId: 'invalid' })).status, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
    const reopened = createServer({ dataFile }).listen(0, '127.0.0.1');
    await new Promise(resolve => reopened.once('listening', resolve));
    const saved = await fetch(`http://127.0.0.1:${reopened.address().port}/api/sessions`).then(r => r.json());
    assert.equal(saved[0].status, 'Completed');
    await new Promise(resolve => reopened.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  }
});
