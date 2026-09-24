# Title

LessonLoop — A Teaching Companion for Python Practice

## One-line Summary

A local MCP-powered lesson workflow that gives students short Python exercises and progressive hints while keeping a simple progress note for teachers.

## Problem

A teacher cannot always give each student immediate, individual feedback during a programming lesson. A student who answers incorrectly needs a useful hint and another chance, while the teacher needs to know who may need help.

## Solution

LessonLoop presents a focused exercise on Python variables, decisions, or loops. Students can ask for hints, submit an answer, and see a short explanation. The teacher view records attempts, hints, completion, the learning goal, and a suggested next step. The same workflow is exposed through a local MCP server so a compatible agent can discover and call the lesson tools.

## Why This Matters

The prototype shows how a small, explicit teaching workflow can connect a conversational interface to classroom progress. It is designed for a teacher to review; it does not claim to replace teaching or assess open-ended programming ability.

## How We Used AI

The runtime does **not** call a language model. It exposes five MCP tools so a compatible AI agent can choose when to start a lesson, request a hint, submit an answer, or inspect progress. Lesson wording and answer checks are authored locally and deterministic. The current browser experience simulates a voice-first Alexa+ concept, with optional browser speech input and playback. No live Alexa account or device is connected. Any future agent integration and its behavior must be demonstrated separately before making stronger AI claims.

## How We Used Codex

Codex created the Node.js server, original lesson content, responsive web interface, JSON session persistence, and a Streamable HTTP MCP endpoint. It added tests for the learner flow, persistence after restart, MCP initialization, tool discovery, tool calls, and origin rejection. We revised the `/mcp` browser GET behavior after the first version displayed no useful browser page. The project owner tested the site on Windows and used PowerShell to initialize the MCP endpoint, list its five tools, create a lesson through `start_lesson`, submit an answer, and confirm the completed session appeared in the browser teacher view.

## Key Features

- Three original, short Python lessons with one question each.
- Progressive hints, answer checking, explanations, and a suggested next topic.
- Saved local sessions and a teacher-facing progress summary.
- Browser speech synthesis and optional speech recognition when supported.
- Five MCP tools: `list_lessons`, `start_lesson`, `get_hint`, `submit_answer`, and `get_progress`.
- A browser-visible status page at `/mcp`, while the MCP client uses POST requests.

## Architecture

Node.js serves the web app and a JSON API on localhost. The MCP endpoint at `/mcp` uses JSON-RPC over Streamable HTTP POST with protocol version `2025-11-25`. Its tools call the same lesson functions used by the browser. Sessions are saved in a local JSON file. Lesson text and expected answers are defined in `curriculum.mjs`. The server offers JSON responses, with no server-initiated event stream. It passed local workflow tests and an independent client check using the official TypeScript MCP SDK `1.30.1`; no Alexa+ runtime test has been completed.

## Testing Instructions

1. Install Node.js 20 or newer, extract the project, run `npm test`, then run `npm start`.
2. Open `http://127.0.0.1:3000/` and complete **Python variables** using answer `5`.
3. Confirm the teacher summary says **Completed** and **1 attempt**. Restart the server, refresh, and reopen the saved session.
4. Open `http://127.0.0.1:3000/mcp` to see the status page. Use a compatible MCP client with the endpoint URL or follow the PowerShell initialization example in the README. Discover the five tools and invoke `start_lesson` with `lessonId: variables` and a pseudonym.
5. Invoke `submit_answer` using the returned session ID and answer `5`. Refresh the web page; the MCP-created session appears in Saved sessions as **Completed**.
6. Run the demo locally. The project has no public demo URL or public authentication; do not expose the local server on the public internet.

An independent `@modelcontextprotocol/sdk` 1.30.1 client successfully connected, discovered all five tools, started a lesson, requested a hint, submitted `5`, and read completed progress. See `mcp-client-verification.md` for the test setup and reproduction script.

## Public Demo Link

TODO: Add a public testing URL only if the project is securely hosted. A locally runnable repository and demonstration video are the intended test path for now.

## Public Repository Link

[GitHub: rajab-rajab/lessonloop-alexa-mcp](https://github.com/rajab-rajab/lessonloop-alexa-mcp) — currently **private**, at commit `9eb81f6` on `main`, with an Apache License 2.0 file. The repository has the application source and tests. Reviewer access has not been confirmed. The screenshot and this draft have not yet been pushed to the repository. Keep `data/`, credentials, and student information out of Git.

## Demo Video

TODO: Record a public English YouTube or Vimeo video **under three minutes**. Proposed sequence: 0:00 problem and goal; 0:20 browser lesson with a wrong answer, hint, and correct answer; 1:10 teacher progress; 1:35 MCP initialization/tool discovery and `start_lesson`/`submit_answer` via a compatible client or PowerShell; 2:15 browser refresh showing the same MCP-created result; 2:35 limitations and closing. Display the running app and MCP calls clearly. Do not depict a real Alexa+ integration.

## Screenshot Shot List

1. Lesson selection and learner view.
2. Hint and corrected answer in the lesson exchange.
3. Completed teacher summary and Saved sessions.
4. MCP tool listing in PowerShell.
5. MCP-created session shown in the web app.

**Received asset:** `public/screenshots/01-mcp-completed-lesson.jpeg` (supplied September 24, 2026). It shows **MCP Test** completing Python variables in one attempt, the suggested next step, and the Saved sessions list. Use it for items 3 and 5. It does not show the MCP request itself, a wrong-answer hint, or a live Alexa+ experience.

## Submission Readiness Notes

The project runs on the owner's Windows machine. The owner reported successful browser use, MCP initialization, five-tool listing, a tool-created variables lesson, answer submission, and the same completed result in the web view. The pasted console output and the supplied screenshot support these observations; the screenshot was copied into `public/screenshots/01-mcp-completed-lesson.jpeg` in the prepared package, but is not yet in GitHub. The local automated checks pass. An independent official TypeScript MCP SDK client also connected and completed the lesson workflow on a fresh local server; see `mcp-client-verification.md`. The repository and Apache License 2.0 file are verified. The draft is not ready for final entry: reviewer access for the private repository, public demo video, additional screenshots, product feedback, and an Alexa+ environment test or a clearly labeled simulation remain open.

## Known Limitations

- One short question per topic; no curriculum-level adaptive sequence or evaluation of arbitrary code.
- Deterministic answer matching, not a language-model tutor.
- No live Alexa+ account, device, or hosted Alexa+ add-on is connected.
- The MCP endpoint is a locally tested subset, with JSON responses and no server push. It interoperated with the official TypeScript MCP SDK `1.30.1`; Alexa+ environment compatibility remains unverified.
- Local session storage has no user authentication; use pseudonyms and keep the app on localhost.
- Browser voice recognition support varies and may use a browser vendor's speech service.

## TODO Official Form Fields

- **Submitter Type:** Confirm Individual/Team/Organization with the project owner.
- **Organization Name:** Use `N/A` if entering individually, after confirmation.
- **Country of Residence:** Confirm Pakistan at final entry.
- **Canadian province:** Use `N/A` if no team member resides in Canada, after confirmation.
- **Primary Track:** Alexa+ is the intended track. Validate the MCP server against an independent client and current official track requirements.
- **New or existing before August 31, 2026:** New project created during the hackathon period; verify before final entry.
- **AWS Builder Mini Challenge:** No AWS service is in the current build; select No unless the project changes. Do not claim AWS integration merely because it uses MCP.
- **Open Source Mini Challenge:** Do not assume this primary project alone qualifies. The official rules ask for an additional open-source project or contribution, its URL, the project repository URL, GitHub username, and a description. Decide after making a qualifying contribution.
- **Product Feedback Q1 (tools used):** MCP specification, Node.js built-ins, browser speech APIs, and Codex. Describe their concrete roles; distinguish sponsor developer tools from general tooling.
- **Product Feedback Q2 (worked well):** Draft from observed setup and PowerShell test; confirm with owner before final entry.
- **Product Feedback Q3 (needs work):** Browser GET initially showed an unhelpful response and was given a status page. Further feedback on Amazon developer tools needs genuine usage evidence.
- **Product Feedback Q4 (onboarding):** Describe the actual steps from local Node setup through tool discovery; confirm any friction and timing with owner.
- **Product Feedback Q5 (build again):** Ask owner for an honest yes/no and reason after testing an independent MCP client.
- **Eligibility declarations:** Owner must personally confirm age, jurisdiction, and no disqualifying employment or conflict.
- **Optional friction log:** Record specific attempted task, steps, expected versus actual result, severity, workaround, and suggested fix if submitting one.
- **GitHub URL:** https://github.com/rajab-rajab/lessonloop-alexa-mcp (private; commit `9eb81f6`).
- **License:** Apache License 2.0 exists in the repository.
- **Video URL, additional screenshots, and reviewer access:** Pending. One screenshot is included in the prepared package, not yet on GitHub.

Official rules and form: https://amazonappdev2026.devpost.com/rules
