import { exportProgressToS3 } from '../s3-report.mjs';

const bucket = process.env.LESSONLOOP_S3_BUCKET;
const region = process.env.AWS_REGION;
if (!bucket || !region) {
  console.error('Set AWS_REGION and LESSONLOOP_S3_BUCKET before running this check.');
  process.exit(2);
}
const sessions = [{ id: 'live-check-redacted', learner: 'Demo Learner', lessonIndex: 0, attempts: 1, hints: 0, correct: true }];
try {
  const result = await exportProgressToS3({ sessions, bucket, region });
  console.log(JSON.stringify({ ok: true, provider: result.provider, bucket: result.bucket, key: result.key, totals: result.totals }, null, 2));
  console.log(`Verify with: aws s3api head-object --bucket "${result.bucket}" --key "${result.key}" --region "${region}"`);
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}
