# Submission evidence and final checklist

## Primary track: Alexa+

LessonLoop provides a self-hosted Streamable HTTP MCP server at `/mcp` using MCP protocol `2025-11-25`. The repository also includes a browser-based voice-first Alexa+ concept simulation. The submission must describe the browser experience as a simulation unless a real Alexa+ environment integration is tested.

Final video evidence to capture:

1. Start the app and open the learner experience.
2. Show a wrong answer, a progressive hint, and a completed answer.
3. Show the teacher mastery state and recommendation reason.
4. Initialize the MCP endpoint and list its eight tools.
5. Call `start_lesson`, `submit_answer`, and `recommend_next` from an MCP client.
6. Refresh the browser and show that the MCP-created session appears in the teacher view.
7. Show the verified Amazon S3 progress-export path and object verification without exposing credentials.

## v0.4.0 adaptive-learning evidence

- Nine authored Python questions across three topics and three difficulty levels.
- Deterministic mastery states derived from completion, attempts, and hints.
- New MCP tool: `recommend_next`.
- Teacher view includes mastery and the reason for the recommended next step.
- Bedrock coaching receives non-identifying progress context and is instructed not to reveal the final answer before deterministic completion.
- Local `npm test` result: **9/9 passing** after the v0.4.0 implementation.
- Manual MCP verification confirmed all eight tools are advertised. The adaptive workflow changed a learner from `In progress` on `variables` to `Completed` / `Developing` and recommended `variables-practice` after two attempts and one hint.

## AWS Builder mini challenge

The code contains two optional AWS integrations:

- Amazon Bedrock Runtime `Converse` for explicit contextual coaching.
- Amazon S3 `PutObject` for explicit anonymous progress-summary export.

Both paths are covered by simulated SDK tests, and the live AWS paths were also exercised from the submitter's account.

### Live Amazon S3 verification — successful

On October 8, 2026 UTC, the `export_progress_to_s3` MCP tool successfully uploaded an anonymous aggregate progress report to a private Amazon S3 bucket in `ap-southeast-2`.

The live MCP result reported:

- `provider`: `Amazon S3`
- `isError`: `false`
- aggregate totals only: 19 sessions, 13 completed, 17 attempts, 7 hints
- an object key under `lessonloop/reports/`

A separate AWS CLI `aws s3api head-object` call confirmed the object exists. The returned metadata showed:

- `ContentType`: `application/json`
- `ContentLength`: 1811 bytes
- `ServerSideEncryption`: `AES256`

This is a **successful live AWS integration** and may be presented as such. Do not expose AWS credentials, account identifiers, or unnecessary bucket details in public submission materials.

### Live Amazon Bedrock verification — reached service, quota-blocked

The `explain_with_bedrock` MCP tool was exercised with valid AWS authentication and Amazon Nova Micro in `ap-southeast-2`. AWS returned:

`Too many tokens per day, please wait before trying again.`

This confirms the authenticated application path reaches Amazon Bedrock, but it is **not** a successful model-response verification. Do not claim successful live Bedrock coaching unless a later invocation returns a real model response.

The repository includes live-account verification helpers:

```powershell
npm run verify:bedrock
npm run verify:s3
```

For future verification, the Bedrock helper must print `"ok": true`; the S3 helper must print `"ok": true` and an object key that can be confirmed independently with `aws s3api head-object`.

## Product feedback draft

Use only observations that can be honestly confirmed.

- **MCP / Streamable HTTP:** The shared browser-and-tool session model works well. A browser-visible `GET /mcp` status page helps human reviewers while MCP clients continue to use POST.
- **Adaptive flow:** Keeping recommendation logic deterministic makes the teacher explanation and MCP `recommend_next` output reproducible and testable.
- **Amazon Bedrock:** Used only for optional coaching, while deterministic grading remains authoritative. Progress context excludes learner identity and session IDs. A live authenticated request reached Bedrock but was blocked by the daily token quota.
- **Amazon S3:** A live `PutObject` path succeeded from the MCP tool. A separate `head-object` call confirmed the JSON object and AES256 server-side encryption. The report contains anonymous aggregate totals rather than learner-level answers or identities.

## Friction log template

| Field | Record |
| --- | --- |
| Task attempted | |
| Steps taken | |
| Expected result | |
| Actual result | |
| Severity | Critical / Important / Nice-to-have |
| Workaround | |
| Suggested improvement | |

Validated AWS friction entry: an authorized Bedrock user selected Amazon Nova Micro and submitted a short anonymized tutoring prompt. The expected result was one coaching response; the actual result was `Too many tokens per day, please wait before trying again.` Severity: Important. Do not infer output quality or successful model inference from this quota-blocked attempt.

## Safe hosting guardrail

Do not publicly deploy the current localhost application or its write-capable MCP endpoint unchanged. It has no production user authentication and stores sessions locally. A hosted version needs protected write APIs, persistent storage, server-side AWS credentials, and an explicit authentication/authorization design.
