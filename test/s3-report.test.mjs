import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProgressReport, exportProgressToS3 } from '../s3-report.mjs';

test('S3 report aggregates progress and excludes learner identity and answers', async () => {
  const sessions = [{ id: 'secret-session', learner: 'Student Name', lessonIndex: 0, attempts: 2, hints: 1, correct: true, answer: 'private answer' }];
  let command;
  const sdkLoader = async () => ({
    PutObjectCommand: class { constructor(input) { command = input; } },
    S3Client: class { constructor(config) { assert.equal(config.region, 'us-east-1'); } async send() { return {}; } destroy() {} }
  });
  const result = await exportProgressToS3({ sessions, bucket: 'lessonloop-test-bucket', region: 'us-east-1', sdkLoader });
  assert.equal(result.totals.completed, 1);
  assert.equal(command.Bucket, 'lessonloop-test-bucket');
  assert.match(command.Key, /^lessonloop\/reports\/.*\.json$/);
  assert.equal(command.ServerSideEncryption, 'AES256');
  assert.doesNotMatch(command.Body, /Student Name|secret-session|private answer/);
  const report = JSON.parse(command.Body);
  assert.equal(report.topics[0].attempts, 2);
  assert.equal(report.topics[0].hints, 1);
});

test('S3 report requires explicit configuration', async () => {
  assert.equal(buildProgressReport([]).totals.sessions, 0);
  await assert.rejects(exportProgressToS3({ sessions: [], bucket: '', region: '' }), /Set LESSONLOOP_S3_BUCKET/);
});
