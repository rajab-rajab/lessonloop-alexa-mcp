# Submission evidence and final checklist

## Primary track: Alexa+

LessonLoop provides a self-hosted Streamable HTTP MCP server at `/mcp` using MCP protocol `2025-11-25`. The repository also includes a browser-based voice-first Alexa+ concept simulation. The submission must describe the browser experience as a simulation unless a real Alexa+ environment integration is tested.

Final video evidence to capture:

1. Start the app and open the learner experience.
2. Show a wrong answer, a progressive hint, and a completed answer.
3. Initialize the MCP endpoint and list its tools.
4. Call `start_lesson` and `submit_answer` from an MCP client.
5. Refresh the browser and show that the MCP-created session appears in the teacher view.

## AWS Builder mini challenge

The code contains two optional AWS integrations:

- Amazon Bedrock Runtime `Converse` for an explicit `explain_with_bedrock` coaching request.
- Amazon S3 `PutObject` for an explicit anonymous progress-summary export.

Both paths are tested with simulated SDK clients. A live, anonymized Nova Micro request was attempted in the Bedrock playground in `ap-southeast-2`; AWS returned `ThrottlingException: Too many tokens per day`. This verifies the account, region, model selection, and invocation path, but **not** a successful model response. Do not claim successful live AWS coaching until the quota is available and a result is captured.

## Product feedback draft

Use only observations you can honestly confirm.

- **MCP / Streamable HTTP:** Used to expose the same lesson workflow to compatible clients. The shared browser-and-tool session model worked well; the initial browser `GET /mcp` response was unclear, so the app now serves a status page for browser visitors while clients use `POST`.
- **Amazon Bedrock:** Used for optional, contextual coaching that does not change deterministic grading. In the Bedrock playground, Amazon Nova Micro was selectable on demand, but the first anonymized request returned a daily-token `ThrottlingException`. Record this as an important friction point; do not infer latency or output quality from it.
- **Amazon S3:** Used only after explicit teacher action to save anonymous aggregate totals. Confirm live onboarding and the object-creation experience only after a real export.

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

Potential entry to validate before use: Browser navigation to `/mcp` initially returned an unhelpful response for a human reviewer, while the actual MCP client required `POST` plus protocol headers. The workaround was to add a browser-visible status page without changing the MCP client endpoint behavior.

Validated AWS friction entry: An authorized user selected Amazon Nova Micro on demand in Amazon Bedrock (`ap-southeast-2`) and submitted a short, anonymized tutoring prompt. The expected result was one coaching response; the actual result was `ThrottlingException: Too many tokens per day`. Severity: Important. Workaround: wait for the quota window to reset, then rerun one short request; do not retry repeatedly or purchase provisioned capacity for this demo. Suggested improvement: make remaining daily test quota and the reset time visible in the Bedrock playground.

## Safe hosting guardrail

Do not publicly deploy the current localhost application or its write-capable MCP endpoint unchanged. It has no user authentication and stores sessions locally. A hosted version needs server-side AWS credentials, protected write APIs, persistent storage, and an explicit authentication/authorization design.
