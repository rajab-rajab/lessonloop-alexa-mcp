import { randomUUID } from 'node:crypto';
import { lessons } from './curriculum.mjs';

export function buildProgressReport(sessions, createdAt = new Date().toISOString()) {
  const topics = lessons.map(lesson => ({ lessonId: lesson.id, title: lesson.title, sessions: 0, completed: 0, attempts: 0, hints: 0 }));
  for (const session of sessions) {
    const topic = topics[session.lessonIndex];
    if (!topic) continue;
    topic.sessions++;
    topic.completed += Number(Boolean(session.correct));
    topic.attempts += Number(session.attempts) || 0;
    topic.hints += Number(session.hints) || 0;
  }
  return { generatedAt: createdAt, kind: 'LessonLoop anonymous teacher progress summary',
    totals: topics.reduce((result, topic) => ({ sessions: result.sessions + topic.sessions, completed: result.completed + topic.completed, attempts: result.attempts + topic.attempts, hints: result.hints + topic.hints }), { sessions: 0, completed: 0, attempts: 0, hints: 0 }), topics };
}

export async function exportProgressToS3({ sessions, bucket = process.env.LESSONLOOP_S3_BUCKET,
  region = process.env.AWS_REGION, sdkLoader = () => import('@aws-sdk/client-s3') } = {}) {
  if (!bucket || !region) throw new Error('Set LESSONLOOP_S3_BUCKET and AWS_REGION to enable S3 export.');
  let sdk;
  try { sdk = await sdkLoader(); }
  catch { throw new Error('Install the optional S3 SDK: npm install @aws-sdk/client-s3'); }
  const report = buildProgressReport(sessions);
  const key = `lessonloop/reports/${report.generatedAt.replace(/[:.]/g, '-')}-${randomUUID()}.json`;
  const client = new sdk.S3Client({ region });
  try {
    await client.send(new sdk.PutObjectCommand({ Bucket: bucket, Key: key,
      Body: JSON.stringify(report, null, 2), ContentType: 'application/json', ServerSideEncryption: 'AES256' }));
    return { provider: 'Amazon S3', bucket, key, totals: report.totals,
      message: 'An anonymous progress summary was saved to your S3 bucket.' };
  } finally { client.destroy?.(); }
}
