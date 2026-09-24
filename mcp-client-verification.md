# LessonLoop independent MCP client verification

Date: September 24, 2026

## Test setup

- Server: LessonLoop `0.3.0` from the prepared source, bound to an ephemeral `127.0.0.1` port with a temporary session file.
- Independent client: official `@modelcontextprotocol/sdk` TypeScript package version `1.30.1`, using `Client` and `StreamableHTTPClientTransport`.
- Protocol handshake: server negotiated `2025-11-25` and reported the tools capability.
- No browser, manually crafted JSON-RPC call, or mock transport was used for this check.

## Observed results

1. `client.connect()` succeeded.
2. `client.listTools()` returned `list_lessons`, `start_lesson`, `get_hint`, `submit_answer`, and `get_progress`.
3. `start_lesson` with learner `SDK Test` and lesson `variables` returned a question and session ID.
4. `get_hint` returned the first hint and recorded `hints: 1`.
5. `submit_answer` with `5` returned `status: Completed`, `attempts: 1`, and next step `Python decisions`.
6. `get_progress` returned the same completed session, including `hints: 1`.
7. The project’s two existing local tests passed afterward.

## Reproduce

With Node.js 20 or later and npm available, install the SDK in a separate temporary directory and use this client script from that directory. The application itself has no npm dependencies. Adjust the URL if the server uses another port.

```js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({ name: 'lessonloop-check', version: '1.0.0' }, { capabilities: {} });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3000/mcp')));
  console.log((await client.listTools()).tools.map(tool => tool.name));
  const started = await client.callTool({ name: 'start_lesson', arguments: { learner: 'SDK Test', lessonId: 'variables' } });
  const id = JSON.parse(started.content[0].text).session.id;
  console.log(await client.callTool({ name: 'get_hint', arguments: { sessionId: id } }));
  console.log(await client.callTool({ name: 'submit_answer', arguments: { sessionId: id, answer: '5' } }));
  console.log(await client.callTool({ name: 'get_progress', arguments: { sessionId: id } }));
} finally {
  await client.close();
}
```

## Scope

This verifies interoperability with one independent MCP SDK client on the local endpoint. It does not establish compatibility with an Alexa+ runtime, public hosting, authentication, every MCP client, or the full MCP feature set. The endpoint is intended to remain on localhost until a secure deployment is designed.
