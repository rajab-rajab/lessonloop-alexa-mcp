# LessonLoop v3

A focused education workflow for the **Build, Ship, Shape: Amazon Developer Hackathon**. A learner practices one Python concept, requests progressive hints, receives immediate feedback, and leaves a concise progress note for a teacher. The same workflow is available through a local MCP endpoint for compatible agents.

## Run locally

Requires Node.js 20 or later. No packages or credentials are needed.

```bash
npm start
```

Open `http://127.0.0.1:3000`. The Streamable HTTP MCP endpoint is `http://127.0.0.1:3000/mcp`. Run `npm test` for workflow and MCP checks. Set `PORT=3001` to choose another port.

Opening `/mcp` in a browser shows a status page. A working MCP client sends JSON-RPC requests by HTTP POST; the browser address bar alone cannot exercise the MCP tools.

## MCP tools

The local endpoint supports protocol version `2025-11-25`, a JSON response to Streamable HTTP POST requests, and five tools: `list_lessons`, `start_lesson`, `get_hint`, `submit_answer`, and `get_progress`. A compatible MCP client can connect to `http://127.0.0.1:3000/mcp` while the server is running. A tool-created lesson appears in the browser's Saved sessions list after refreshing the page.

Example request in PowerShell after starting the server:

```powershell
$headers = @{ Accept = 'application/json, text/event-stream'; 'MCP-Protocol-Version' = '2025-11-25' }
$message = @{ jsonrpc = '2.0'; id = 1; method = 'initialize'; params = @{ protocolVersion = '2025-11-25'; capabilities = @{}; clientInfo = @{ name = 'manual-check'; version = '1.0' } } } | ConvertTo-Json -Depth 6
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/mcp' -Method Post -Headers $headers -ContentType 'application/json' -Body $message
```

The server binds to `127.0.0.1` only and rejects foreign browser origins. It has no account authentication and must not be exposed to the public internet. It supports a focused subset of MCP, with JSON responses and no server push stream; the included tests exercise the supported handshake and tools. Further interoperability testing with the intended Alexa+ environment is still required.

## Demo path

1. Enter a learner name and start **Python variables**.
2. Request a hint; submit `4` to see the retry guidance.
3. Submit `5` to complete the lesson; read the teacher summary.
4. Start **Python decisions** and answer `cool`.
5. Select **Read aloud** to hear the latest guidance if the browser supports speech synthesis.

## Architecture and boundaries

- Node HTTP server serves the web interface and a small JSON API.
- Original, locally defined lesson content supplies all answers and explanations. The answer checker handles concise expected responses; it is not an AI evaluator.
- Sessions are saved locally in `data/sessions.json` and remain available after a restart. The file stays on the local machine; do not enter sensitive student information or deploy this prototype publicly without access controls.
- The **Saved sessions** list restores earlier lessons. In supported browsers, **Speak answer** fills the answer field using browser speech recognition; review the transcript before pressing Check. Browser voice services may process audio according to their own policies.
- This is an **Alexa+ concept with a local MCP server**. It does not claim a live Alexa+ integration, an Amazon account connection, or a working Amazon device demo. The MCP interface and browser demo are separate ways to drive the same lesson workflow.
- Voice output uses the browser's speech synthesis; typed answers make the demo usable without a microphone.

## Development and submission

The prototype is an initial build, not a finished Devpost submission. Before entering, improve the guided learning experience, test with intended users, document product feedback, and record a public English video shorter than three minutes. The GitHub repository must include the full source and setup instructions. Check the [official rules](https://amazonappdev2026.devpost.com/rules) for current requirements. A public repository also needs an open-source license; choose one with the project owner before publishing.
