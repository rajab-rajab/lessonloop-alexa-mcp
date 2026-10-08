# LessonLoop

**Adaptive Python practice with MCP tools, deterministic grading, and a teacher progress view.**

LessonLoop is an education prototype for the [Build, Ship, Shape: Amazon Developer Hackathon](https://amazonappdev2026.devpost.com/). A learner works through short Python questions, requests progressive hints, receives deterministic answer checking, and gets a recommended next step. The teacher view shows attempts, hints, mastery, completion, and the reason for the recommendation. A local MCP server exposes the same workflow to compatible agents.

> **Scope:** The browser experience is an Alexa+ concept simulation. The MCP endpoint works locally, but the project does not connect to an Alexa+ account, service, or device. Deterministic grading remains authoritative. Amazon Bedrock is optional coaching only.

## Features

- Nine original Python questions across variables, decisions, and loops.
- Three difficulty levels per topic: Starter, Practice, and Challenge.
- Deterministic adaptive mastery: **Strong**, **Developing**, **Needs support**, or **In progress**.
- Progressive hints, retry feedback, explanations, and a reasoned next-step recommendation.
- Teacher summary with learning goal, attempts, hints used, mastery, status, and recommendation reason.
- Saved sessions that remain available after a server restart.
- Browser speech playback and optional speech input where supported; typing always works.
- Eight MCP tools operating on the same sessions as the browser.
- Optional Amazon Bedrock coaching through the Converse API.
- Amazon S3 export of anonymous aggregate teacher progress; the live MCP export path has been successfully verified.

## Requirements and quick start

Requires Node.js **20 or later** and npm.

```powershell
git clone https://github.com/rajab-rajab/lessonloop-alexa-mcp.git
cd lessonloop-alexa-mcp
npm install
npm test
npm start
```

Open **http://127.0.0.1:3000/** for the learner app and **http://127.0.0.1:3000/mcp** for the MCP status page.

To change the port in PowerShell:

```powershell
$env:PORT = '3001'
npm start
```

## Adaptive learning workflow

A session is classified deterministically from completion, attempts, and hints:

- **Strong:** completed quickly without hints.
- **Developing:** completed with limited support.
- **Needs support:** repeated attempts or multiple hints indicate reinforcement is appropriate.
- **In progress:** the learner is still working on the current concept.

The adaptive engine then recommends either a harder question in the same topic, continued practice, reinforcement, or the next topic. The same recommendation is visible in the teacher view and available through MCP using `recommend_next`.

Example progression:

```text
variables → variables-practice → variables-challenge → conditionals → ...
```

## MCP server

The local endpoint uses JSON-RPC over Streamable HTTP POST and advertises MCP protocol version `2025-11-25` with a tools capability.

| Tool | Purpose | Inputs |
| --- | --- | --- |
| `list_lessons` | List lesson IDs and learning goals | None |
| `start_lesson` | Create a learner session and return its question | `lessonId`, optional `learner` |
| `get_hint` | Return the next progressive hint | `sessionId` |
| `submit_answer` | Deterministically check an answer and update progress | `sessionId`, `answer` |
| `get_progress` | Read session state and teacher summary | `sessionId` |
| `recommend_next` | Return the deterministic next-lesson recommendation | `sessionId` |
| `explain_with_bedrock` | Optional Amazon Bedrock coaching using progress context | `sessionId`, `answer` |
| `export_progress_to_s3` | Upload an anonymous aggregate report to Amazon S3 | None |

A session created through MCP appears under **Saved sessions** in the browser because the browser and MCP tools share the same persisted session state.

### Check the MCP endpoint in PowerShell

```powershell
$uri = 'http://127.0.0.1:3000/mcp'
$headers = @{
  Accept = 'application/json, text/event-stream'
  'MCP-Protocol-Version' = '2025-11-25'
}

$init = @{
  jsonrpc = '2.0'
  id = 1
  method = 'initialize'
  params = @{
    protocolVersion = '2025-11-25'
    capabilities = @{}
    clientInfo = @{ name = 'powershell-check'; version = '1.0' }
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Uri $uri -Method Post -Headers $headers `
  -ContentType 'application/json' -Body $init
```

## Amazon Bedrock coaching

`explain_with_bedrock` and the **Ask AWS coach** button invoke Amazon Bedrock's Converse API. The request contains lesson facts, the learner's typed answer, and non-identifying progress context such as attempts, hints used, mastery, and completion. It does **not** send the learner name or session ID.

The deterministic lesson engine still decides whether an answer is correct. Before completion, the Bedrock system prompt explicitly tells the model not to reveal the final answer.

Configure an accessible Bedrock model and region:

```powershell
$env:AWS_REGION = 'ap-southeast-2'
$env:LESSONLOOP_BEDROCK_MODEL_ID = '<your-enabled-model-or-inference-profile>'
npm run verify:bedrock
```

A live authenticated Nova Micro request reached Amazon Bedrock from the MCP tool, but the service returned a daily-token quota error. This proves the application path reaches Bedrock, but **does not** prove a successful model response. Only describe Bedrock coaching as successfully live-verified after an invocation returns real model output.

## Amazon S3 progress export

LessonLoop can explicitly upload an **anonymous aggregate progress report** to a private S3 bucket. Reports contain totals by topic such as sessions, completions, attempts, and hints. They exclude learner names, session IDs, and answers.

```powershell
$env:AWS_REGION = 'ap-southeast-2'
$env:LESSONLOOP_S3_BUCKET = '<your-private-bucket>'
npm run verify:s3
```

### Verified live AWS result

On October 8, 2026 UTC, the `export_progress_to_s3` MCP tool successfully uploaded an anonymous JSON progress report to Amazon S3 in `ap-southeast-2`. A separate AWS CLI `head-object` call confirmed that the object exists and reported `ContentType: application/json`, a content length of 1811 bytes, and server-side encryption `AES256`.

The verified report contained aggregate totals only: 19 sessions, 13 completed, 17 attempts, and 7 hints. No learner names, session IDs, or answers were included in the exported report.

## Project structure

| Path | Role |
| --- | --- |
| `server.mjs` | HTTP server, browser API, MCP endpoint, persistence |
| `adaptive.mjs` | Deterministic mastery and next-step recommendation logic |
| `mcp.mjs` | MCP tool definitions and JSON-RPC helpers |
| `curriculum.mjs` | Nine authored Python questions and deterministic grading |
| `bedrock.mjs` | Optional Amazon Bedrock coaching |
| `s3-report.mjs` | Anonymous Amazon S3 progress export |
| `public/` | Learner and teacher interface |
| `scripts/` | Live AWS verification helpers |
| `test/` | Workflow, adaptation, MCP, Bedrock, S3, and persistence checks |

Sessions are saved to `data/sessions.json`. This directory is excluded from Git. Use pseudonyms; no real student data is needed.

## Verification

Run:

```powershell
npm test
```

The v0.4.0 local suite passes **9/9 tests**, covering adaptive advancement/reinforcement, workflow persistence, MCP initialization and recommendation behavior, Bedrock request construction and privacy, and S3 privacy behavior.

Manual MCP verification also confirmed that all eight tools are advertised and that the adaptive recommendation changes from Starter to Practice when a learner completes a lesson with limited support.

The repository also includes `mcp-client-verification.md` documenting an independent connection using the official TypeScript MCP SDK.

## Security and privacy

- The server binds to `127.0.0.1` by default.
- Foreign browser origins are rejected at `/mcp`.
- There are no user accounts or production authentication; do not expose the localhost server publicly unchanged.
- Browser speech recognition may use the browser vendor's service.
- Bedrock receives no learner name or session ID.
- S3 export contains aggregate totals rather than learner-level records.

## Limitations

- The prototype contains three Python topics and nine authored questions; it does not execute arbitrary Python code.
- Grading uses deterministic expected-answer matching rather than an LLM.
- Alexa+ account, device, and runtime compatibility remain unverified.
- Bedrock live access has reached the service but remains quota-blocked; a successful model response has not yet been recorded.

## Hackathon demo

**Narrated demo:** [LessonLoop: Guided Python Practice, Teacher Progress Tracking & MCP Tools](https://youtu.be/PAUA3DM8F9I) (2 minutes 58 seconds).

The existing video demonstrates the original local workflow. The final submission demo should additionally show the v0.4.0 adaptive recommendation, MCP `recommend_next`, and the now-verified live S3 export. Do not present Bedrock coaching as a successful live model response unless a later invocation succeeds.

See [`submission-evidence.md`](submission-evidence.md) and [`IMPLEMENTATION-REPORT.md`](IMPLEMENTATION-REPORT.md) for submission evidence and the v0.4.0 change summary.

## License

Licensed under the [Apache License 2.0](LICENSE).
