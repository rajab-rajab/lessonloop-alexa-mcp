export const protocolVersion = '2025-11-25';

export const tools = [
  { name: 'list_lessons', description: 'List the available original Python lessons and learning goals.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'start_lesson', description: 'Start one learner lesson and return its question. Creates local progress.', inputSchema: { type: 'object', properties: { learner: { type: 'string', description: 'A first name or pseudonym, maximum 40 characters.' }, lessonId: { type: 'string', enum: ['variables', 'conditionals', 'loops'] } }, required: ['lessonId'], additionalProperties: false } },
  { name: 'get_hint', description: 'Get the next hint for an existing lesson session.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'], additionalProperties: false } },
  { name: 'submit_answer', description: 'Submit a learner answer for checking and update progress.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' }, answer: { type: 'string', maxLength: 200 } }, required: ['sessionId', 'answer'], additionalProperties: false } },
  { name: 'get_progress', description: 'Read one learner session and the teacher summary.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'], additionalProperties: false } },
  { name: 'explain_with_bedrock', description: 'Optional AWS Bedrock coaching for an existing lesson session and answer. Requires AWS configuration; sends lesson facts and the answer, not the learner name.', inputSchema: { type: 'object', properties: { sessionId: { type: 'string' }, answer: { type: 'string', maxLength: 200 } }, required: ['sessionId', 'answer'], additionalProperties: false } },
  { name: 'export_progress_to_s3', description: 'Explicitly upload an anonymous aggregate teacher progress report to a configured private Amazon S3 bucket. Does not include learner names, session IDs, or answers.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }
];

export function mcpResponse(id, result) { return { jsonrpc: '2.0', id, result }; }
export function mcpError(id, code, message) { return { jsonrpc: '2.0', id, error: { code, message } }; }
export function toolResult(value, isError = false) {
  return { content: [{ type: 'text', text: JSON.stringify(value) }], isError };
}
