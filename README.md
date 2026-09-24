# LessonLoop

**Guided Python practice with MCP tools and a teacher progress view.**

LessonLoop is an education prototype for the [Build, Ship, Shape: Amazon Developer Hackathon](https://amazonappdev2026.devpost.com/). A learner answers a Python question, requests hints, and receives an explanation. The teacher view shows attempts, hints, completion, and the suggested next topic. A local MCP server exposes the same workflow to compatible agents.

> **Scope:** The browser experience is an Alexa+ concept simulation. The local MCP endpoint works, but the project does not connect to an Alexa+ account, service, or device. Answer checking is deterministic; no language model runs inside the app.

## Features

- Three original lessons: Python variables, decisions, and loops.
- One question per lesson, two progressive hints, retry feedback, and an explanation.
- A teacher summary with learning goal, attempts, hints used, status, and next step.
- Saved sessions that remain available after a server restart.
- Browser speech playback and optional speech input where supported; typing always works.
- Seven MCP tools operating on the same sessions as the browser (five work without AWS).
- Optional Amazon Bedrock coaching through the Converse API, available in both the browser and MCP.
- Optional Amazon S3 export of anonymous teacher progress totals, available through an explicit browser button or MCP tool.

## Requirements and quick start

Requires Node.js **20 or later** and npm. The application uses Node.js built-in modules; `npm install` is not needed to run it.

```powershell
git clone https://github.com/rajab-rajab/lessonloop-alexa-mcp.git
cd lessonloop-alexa-mcp
npm test
npm start
```

The repository is currently private, so cloning requires authorized GitHub access. You can also run the commands from an extracted project ZIP. Open **http://127.0.0.1:3000/** for the learner app and **http://127.0.0.1:3000/mcp** for the MCP status page. Stop the server with `Ctrl+C`.

To change the port in PowerShell:

```powershell
$env:PORT = '3001'
npm start
```

Opening `/mcp` in a browser shows a status page. MCP clients send HTTP POST requests to that URL.

## Try the learner workflow

1. Enter a pseudonym and choose **Python variables**.
2. Select **Start lesson**. Try `4` for retry guidance or select **Give me a hint**.
3. Answer `5` to complete the lesson.
4. Read the teacher summary and suggested next step, **Python decisions**.
5. Restart the server and reopen the session under **Saved sessions**.

The other sample answers are `cool` for decisions and `3` for loops. The content in [`curriculum.mjs`](curriculum.mjs) was written for this prototype; it is not an official textbook extract.

## MCP server

The local endpoint uses JSON-RPC over Streamable HTTP POST and advertises MCP protocol version `2025-11-25` with a tools capability. It returns JSON responses. An independent client built with the official TypeScript MCP SDK **1.30.1** connected, discovered all five original tools, and completed a lesson locally.

| Tool | Purpose | Inputs |
| --- | --- | --- |
| `list_lessons` | List lesson IDs and learning goals | None |
| `start_lesson` | Create a session and return its question | `lessonId`, optional `learner` |
| `get_hint` | Return the next hint | `sessionId` |
| `submit_answer` | Check an answer and update progress | `sessionId`, `answer` |
| `get_progress` | Read the session and teacher summary | `sessionId` |
| `explain_with_bedrock` | Optional Amazon Bedrock explanation | `sessionId`, `answer` |
| `export_progress_to_s3` | Optional anonymous teacher summary upload to Amazon S3 | None |

### Check the MCP endpoint in PowerShell

Keep `npm start` running and open a second PowerShell window:

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

Discover the tools:

```powershell
$list = @{ jsonrpc = '2.0'; id = 2; method = 'tools/list'; params = @{} } |
  ConvertTo-Json -Depth 5

(Invoke-RestMethod -Uri $uri -Method Post -Headers $headers `
  -ContentType 'application/json' -Body $list).result.tools |
  Select-Object name, description
```

A session created through an MCP tool appears under **Saved sessions** after refreshing the browser. The independent SDK verification report is available in the project materials; it is not yet part of this GitHub repository.

## Optional AWS Builder integration: Amazon Bedrock

The sixth MCP tool, `explain_with_bedrock`, and the **Ask AWS coach** button invoke Amazon Bedrock's Converse API through the official AWS SDK for JavaScript v3. The feature sends the lesson objective, question, authored expected answer and explanation, and the answer typed by the learner. It does not send the learner name, session ID, or saved progress. The generated explanation is shown alongside the original deterministic answer check; it does not change grades.

To enable this optional feature, configure AWS credentials using the standard AWS SDK credential chain, choose a Bedrock model accessible to your account in the selected Region, and run:

```powershell
npm install @aws-sdk/client-bedrock-runtime
$env:AWS_REGION = 'us-east-1'
$env:LESSONLOOP_BEDROCK_MODEL_ID = '<your-enabled-model-id-or-inference-profile>'
npm start
```

Your AWS identity needs `bedrock:InvokeModel` permission for the selected model or inference profile. The SDK calls `BedrockRuntimeClient.send(new ConverseCommand(...))` in [`bedrock.mjs`](bedrock.mjs). Choose a model that supports Converse; AWS model access and charges depend on your account and Region. With no AWS configuration, the base app and its five original tools continue working and the coaching button stays hidden. If AWS is configured but a call fails, the app reports an error rather than presenting a fabricated AWS response. Do not send real student data to a model without the appropriate consent and review.

The included unit test replaces the SDK with a simulated response and verifies the Converse request. **A live AWS invocation has not been verified in this repository's test environment.** For an AWS Builder submission, configure your own AWS account, run a real call, and record that result in an updated demonstration.

### Alternative AWS integration: Amazon S3 progress summary

Some AWS accounts have a zero daily Bedrock model token quota. LessonLoop can also save an **anonymous aggregate progress report** to a private Amazon S3 bucket. It contains only totals by Python topic (sessions, completions, attempts, and hints); it excludes learner names, session IDs, and answers. Nothing uploads automatically: a teacher must select **Save anonymous summary to AWS S3**, or an MCP client must explicitly call `export_progress_to_s3`.

To try it in PowerShell with your signed-in AWS CLI, create a unique bucket in the same Region and install the S3 SDK:

```powershell
$bucket = "lessonloop-rajab-$(Get-Random -Maximum 99999999)"
aws s3api create-bucket --bucket $bucket --region us-east-1
npm install @aws-sdk/client-s3
$env:AWS_REGION = 'us-east-1'
$env:LESSONLOOP_S3_BUCKET = $bucket
npm start
```

Your AWS identity needs `s3:PutObject` for the bucket (and permission to create it for the command above). Keep the bucket private; do not put real learner data in the prototype. Start a sample lesson, complete it, then select the S3 button in the teacher panel. The app reports the object key only after `S3Client.send(new PutObjectCommand(...))` succeeds. Verify the uploaded object with the returned key:

```powershell
aws s3api head-object --bucket $bucket --key '<key-shown-in-app>' --region us-east-1
```

The S3 unit test verifies the upload request and privacy fields with a simulated SDK response. **A live S3 upload must still be verified in your AWS account and shown in a new AWS Builder demo.** S3 storage and requests may incur AWS charges.

## Project structure

| Path | Role |
| --- | --- |
| [`server.mjs`](server.mjs) | HTTP server, browser API, MCP endpoint, session persistence |
| [`mcp.mjs`](mcp.mjs) | Tool definitions and JSON-RPC response helpers |
| [`bedrock.mjs`](bedrock.mjs) | Optional AWS Bedrock Converse integration |
| [`s3-report.mjs`](s3-report.mjs) | Optional anonymous teacher report upload to Amazon S3 |
| [`curriculum.mjs`](curriculum.mjs) | Lessons and expected-answer checking |
| [`public/`](public/) | Learner and teacher interface with browser speech controls |
| [`test/`](test/) | Workflow, persistence, MCP, and origin checks |

Sessions are saved to `data/sessions.json`. This directory is excluded by [`.gitignore`](.gitignore). Use pseudonyms; no real student data is needed.

## Verification

Run `npm test` for the local checks. They cover wrong and correct answers, hints, teacher progress, restart persistence, MCP initialization and tool calls, protocol-version handling, origin rejection, and browser status behavior.

Separately, the official TypeScript MCP SDK `Client` and `StreamableHTTPClientTransport` connected to a fresh local server. The client called `start_lesson`, `get_hint`, `submit_answer`, and `get_progress`, ending with **Completed**, one hint, and one attempt. This proves interoperability with that client on localhost; it does **not** prove Alexa+ runtime integration.

## Security and privacy

- The server binds to `127.0.0.1` and rejects foreign browser origins at `/mcp`.
- There are **no accounts or authentication**. Do not expose this server to the public internet or store real student information in its local sessions.
- Browser speech recognition may use the browser vendor's service. Review its transcript before selecting **Check**.
- MCP tools can update local sessions. Connect only a trusted client and review its actions.

## Limitations

- Three topics and one fixed question per topic; no evaluation of arbitrary Python code.
- Deterministic matching rather than an AI-generated assessment.
- JSON responses only; no MCP server push stream or public authentication.
- Alexa+ account, device, and runtime compatibility remain unverified.

## Hackathon demo

**Watch the narrated demo:** [LessonLoop: Guided Python Practice, Teacher Progress Tracking & MCP Tools](https://youtu.be/PAUA3DM8F9I) (2 minutes 58 seconds).

The video demonstrates the original local workflow. It does **not** demonstrate a live Amazon Bedrock invocation. Present Alexa+ as a **concept** unless an actual integration has been tested. Follow the [official event rules](https://amazonappdev2026.devpost.com/rules) for final access, video, feedback, and submission requirements.

## License

Licensed under the [Apache License 2.0](LICENSE).
