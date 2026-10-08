import { explainWithBedrock } from '../bedrock.mjs';
const region = process.env.AWS_REGION;
const modelId = process.env.LESSONLOOP_BEDROCK_MODEL_ID;
if (!region || !modelId) {
  console.error('Set AWS_REGION and LESSONLOOP_BEDROCK_MODEL_ID before running this check.');
  process.exit(2);
}
try {
  const result = await explainWithBedrock({ lessonId: 'variables', answer: '4', attempts: 1, hints: 0, mastery: 'In progress', completed: false, region, modelId });
  console.log(JSON.stringify({ ok: true, provider: result.provider, modelId: result.modelId, speech: result.speech }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}
