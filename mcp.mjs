export const protocolVersion = '2025-11-25';

const lessonIds = ['variables','variables-practice','variables-challenge','conditionals','conditionals-practice','conditionals-challenge','loops','loops-practice','loops-challenge'];
export const tools = [
  { name: 'list_lessons', description: 'List the available original Python lessons and learning goals.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'start_lesson', description: 'Start one learner lesson and return its question. Creates local progress.', inputSchema: { type: 'object', properties: { learner: { type: 'string', description: 'A first name or pseudonym, maximum 40 characters.' }, lessonId: { type: 'string', enum: lessonIds } }, required: ['lessonId'], additionalProperties: false } },
  { name: 'get_hint', description: 'Get the next hint for an existing lesson session.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'], additionalProperties: false } },
  { name: 'submit_answer', description: 'Submit a learner answer for deterministic checking and update progress.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' }, answer: { type: 'string', maxLength: 200 } }, required: ['sessionId', 'answer'], additionalProperties: false } },
  { name: 'get_progress', description: 'Read one learner session, mastery state, and teacher summary.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'], additionalProperties: false } },
  { name: 'recommend_next', description: 'Return the deterministic next lesson recommendation based on attempts, hints, completion, and difficulty.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'], additionalProperties: false } },
  { name: 'explain_with_bedrock', description: 'Optional Amazon Bedrock coaching using lesson facts plus progress context. Requires AWS configuration and does not send learner identity.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' }, answer: { type: 'string', maxLength: 200 } }, required: ['sessionId', 'answer'], additionalProperties: false } },
  { name: 'export_progress_to_s3', description: 'Explicitly upload an anonymous aggregate teacher progress report to a configured private Amazon S3 bucket.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }
];
export function mcpResponse(id, result) { return { jsonrpc: '2.0', id, result }; }
export function mcpError(id, code, message) { return { jsonrpc: '2.0', id, error: { code, message } }; }
export function toolResult(value, isError = false) { return { content: [{ type: 'text', text: JSON.stringify(value) }], isError }; }
