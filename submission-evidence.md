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

## v0.4.0 adaptive-learning evidence

- Nine authored Python questions across three topics and three difficulty levels.
- Deterministic mastery states derived from completion, attempts, and hints.
- New MCP tool: `recommend_next`.
- Teacher view includes mastery and the reason for the recommended next step.
- Bedrock coaching receives non-identifying progress context and is instructed not to reveal the final answer before deterministic completion.
- Local `npm test` result: **9/9 passing** after the v0.4.0 implementation.

## AWS Builder mini challenge

The code contains two optional AWS integrations:

- Amazon Bedrock Runtime `Converse` for explicit contextual coaching.
- Amazon S3 `PutObject` for explicit anonymous progress-summary export.

Both paths are covered by simulated SDK tests. A previous live, anonymized Nova Micro request in Amazon Bedrock returned `ThrottlingException: Too many tokens per day`. This demonstrates an attempted live invocation path, but **not** a successful model response.

The repository now includes live-account verification helpers:

```powershell
npm run verify:bedrock
npm run verify:s3
```

Do not mark either AWS integration as successfully live-verified unless its corresponding command succeeds in the submitter's AWS account. The Bedrock helper must print `"ok": true`; the S3 helper must print `"ok": true` and an object key that can be confirmed with `aws s3api head-object`.

## Product feedback draft

Use only observations that can be honestly confirmed.

- **MCP / Streamable HTTP:** The shared browser-and-tool session model works well. A browser-visible `GET /mcp` status page helps human reviewers while MCP clients continue to use POST.
- **Adaptive flow:** Keeping recommendation logic deterministic makes the teacher explanation and MCP `recommend_next` output reproducible and testable.
- **Amazon Bedrock:** Used only for optional coaching, while deterministic grading remains authoritative. Progress context excludes learner identity and session IDs.
- **Amazon S3:** Used only after explicit action to save anonymous aggregate totals. Confirm live onboarding and object creation only after a real export succeeds.

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

Validated AWS friction entry: an authorized Bedrock user selected Amazon Nova Micro and submitted a short anonymized tutoring prompt. The expected result was one coaching response; the actual result was `ThrottlingException: Too many tokens per day`. Severity: Important. Do not infer output quality or successful integration from this failed attempt.

## Safe hosting guardrail

Do not publicly deploy the current localhost application or its write-capable MCP endpoint unchanged. It has no production user authentication and stores sessions locally. A hosted version needs protected write APIs, persistent storage, server-side AWS credentials, and an explicit authentication/authorization design.
