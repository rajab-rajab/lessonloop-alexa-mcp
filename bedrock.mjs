import { lessons } from './curriculum.mjs';

export async function explainWithBedrock({ lessonId, answer, attempts = 0, hints = 0, mastery = 'In progress', completed = false,
  modelId = process.env.LESSONLOOP_BEDROCK_MODEL_ID, region = process.env.AWS_REGION,
  sdkLoader = () => import('@aws-sdk/client-bedrock-runtime') } = {}) {
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson) throw new Error('Choose a listed lesson.');
  if (!modelId || !region) throw new Error('Set LESSONLOOP_BEDROCK_MODEL_ID and AWS_REGION to enable AWS coaching.');
  const response = String(answer ?? '').trim().slice(0, 200);
  if (!response) throw new Error('Enter an answer first.');
  let sdk;
  try { sdk = await sdkLoader(); } catch { throw new Error('Install the optional AWS SDK: npm install @aws-sdk/client-bedrock-runtime'); }
  const client = new sdk.BedrockRuntimeClient({ region, maxAttempts: 5, retryMode: 'adaptive' });
  try {
    const systemText = `You are a patient Python tutor. Use only the supplied lesson facts. Give one short supportive explanation. Do not claim to execute code. Adapt to the learner progress. On early attempts give a conceptual clue; after repeated difficulty be more explicit. ${completed ? 'The deterministic lesson engine has marked this lesson complete, so you may explain the final answer.' : 'The lesson is not complete, so do not reveal the final answer; guide the learner toward it.'}`;
    const payload = { objective: lesson.objective, question: lesson.question, expectedAnswer: lesson.answer, explanation: lesson.explanationAfter, learnerAnswer: response, progress: { attempts, hintsUsed: hints, mastery, completed } };
    const result = await client.send(new sdk.ConverseCommand({ modelId, system: [{ text: systemText }], messages: [{ role: 'user', content: [{ text: JSON.stringify(payload) }] }], inferenceConfig: { maxTokens: 180, temperature: 0.2 } }));
    const explanation = result.output?.message?.content?.map(part => part.text || '').join(' ').trim();
    if (!explanation) throw new Error('Bedrock returned no text.');
    return { speech: explanation, provider: 'Amazon Bedrock', modelId };
  } finally { client.destroy?.(); }
}
