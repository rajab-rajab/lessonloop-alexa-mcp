import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendNext, masteryFor } from '../adaptive.mjs';

test('strong mastery advances difficulty', () => {
  const session = { lessonIndex: 0, attempts: 1, hints: 0, correct: true };
  assert.equal(masteryFor(session), 'Strong');
  assert.equal(recommendNext(session).recommendedLessonId, 'variables-practice');
});

test('developing mastery continues practice', () => {
  const session = { lessonIndex: 0, attempts: 2, hints: 1, correct: true };
  assert.equal(masteryFor(session), 'Developing');
  assert.equal(recommendNext(session).recommendedLessonId, 'variables-practice');
});

test('repeated difficulty triggers reinforcement', () => {
  const session = { lessonIndex: 1, attempts: 3, hints: 2, correct: false };
  assert.equal(masteryFor(session), 'Needs support');
  assert.equal(recommendNext(session).recommendedLessonId, 'variables');
});
