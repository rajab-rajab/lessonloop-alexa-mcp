import test from 'node:test';
import assert from 'node:assert/strict';
import { explainWithBedrock } from '../bedrock.mjs';

test('AWS coaching sends lesson facts and answer through Converse without learner identity', async () => {
  let command;
  const sdkLoader = async () => ({
    ConverseCommand: class { constructor(input) { command = input; } },
    BedrockRuntimeClient: class {
      constructor(config) { assert.equal(config.region, 'us-east-1'); }
      async send() { return { output: { message: { content: [{ text: 'Start at three, then add two.' }] } } }; }
      destroy() {}
    }
  });
  const result = await explainWithBedrock({ lessonId: 'variables', answer: '4', region: 'us-east-1', modelId: 'test-model', sdkLoader });
  assert.equal(result.speech, 'Start at three, then add two.');
  assert.equal(command.modelId, 'test-model');
  assert.match(command.messages[0].content[0].text, /learnerAnswer.*4/);
  assert.doesNotMatch(command.messages[0].content[0].text, /learnerName|sessionId/);
});

test('AWS coaching requires explicit configuration', async () => {
  await assert.rejects(explainWithBedrock({ lessonId: 'variables', answer: '5', modelId: '', region: '' }), /Set LESSONLOOP/);
});
