import { lessons } from './curriculum.mjs';

// Optional AWS feature. No learner name, session ID, or saved progress is sent.
export async function explainWithBedrock({ lessonId, answer, modelId = process.env.LESSONLOOP_BEDROCK_MODEL_ID,
  region = process.env.AWS_REGION, sdkLoader = () => import('@aws-sdk/client-bedrock-runtime') } = {}) {
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson) throw new Error('Choose a listed lesson.');
  if (!modelId || !region) throw new Error('Set LESSONLOOP_BEDROCK_MODEL_ID and AWS_REGION to enable AWS coaching.');
  const response = String(answer ?? '').trim().slice(0, 200);
  if (!response) throw new Error('Enter an answer first.');
  let sdk;
  try { sdk = await sdkLoader(); }
  catch { throw new Error('Install the optional AWS SDK: npm install @aws-sdk/client-bedrock-runtime'); }
  const client = new sdk.BedrockRuntimeClient({ region });
  try {
    const result = await client.send(new sdk.ConverseCommand({
      modelId,
      system: [{ text: 'You are a patient Python tutor. Use only the supplied lesson facts. Give one short, supportive explanation. Do not claim to execute code. If the learner answer is incorrect, help them reason toward the answer without presenting unsupported facts.' }],
      messages: [{ role: 'user', content: [{ text: JSON.stringify({ objective: lesson.objective, question: lesson.question, expectedAnswer: lesson.answer, explanation: lesson.explanationAfter, learnerAnswer: response }) }] }],
      inferenceConfig: { maxTokens: 180, temperature: 0.2 }
    }));
    const explanation = result.output?.message?.content?.map(part => part.text || '').join(' ').trim();
    if (!explanation) throw new Error('Bedrock returned no text.');
    return { speech: explanation, provider: 'Amazon Bedrock', modelId };
  } finally { client.destroy?.(); }
}
