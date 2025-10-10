# Performance Investigation – `/api/chat-v2`

## Overview
- Telemetry and new `[PERF]` console logs are now emitted for every request (`app/api/chat-v2/route.ts`) so we can break latency into parse, intent, extraction, and agent phases.
- Instrumentation shows the slow path is dominated by repeated large LLM invocations: intent (1 call), field extraction (1 call), and multi-step sales agent (≥1 call per step). Each call previously received the full conversation with portfolio context (~1.5–2k tokens) which drove 45 s response times and 2.5k token usage.
- Frontend changes ensure we only send the heavy portfolio context once per session and add client-side logging to confirm message batching and localStorage behavior.

## Current Measurement Hooks
- `app/api/chat-v2/route.ts`: Logs for request start, JSON parse, intent detection, extraction, sales agent duration, agent steps, token usage, individual step metadata, and total latency (success + error paths). Telemetry records the same breakdown for dashboards.
- `app/lib/ai/agents/field-extractor-agent.ts`: Logs the original vs trimmed history length, cache hits, and re-use of completed results.
- `app/lib/ai/agents/sales-agent.ts`: Logs trimmed tool-history size and when the agent stops due to email send or max steps.
- `app/components/Apps/Chatbot/Chatbot.tsx`: Logs localStorage restore/persist activity, every outbound message (`sendMessage`), added portfolio context, and the API response envelope.

**Next run instructions**
1. Start a local conversation and capture the server console output.  
2. Compare `[PERF] Intent detected`, `[PERF] Fields extracted`, and `[PERF] Sales agent completed` to pinpoint any remaining hot spots.  
3. Watch for `[FieldExtractor] Using cached extraction...` to confirm cache hits after all required fields are collected.

## Bottlenecks Identified (pre-fix)
1. **Field extraction rework on 70B** – The extractor analysed the entire conversation (including long system context) on every request with `llama-3.3-70b-versatile`, leading to multi-second latency and high token spend.
2. **Sales agent payload bloat** – The agent embedded the full JSON conversation (including system message) inside the final user turn, inflating token counts each step and encouraging unnecessary loops.
3. **Frontend history duplication** – Every request re-sent the expensive portfolio context system message plus the full chat log, and localStorage writes had no visibility into frequency, making client/server duplication harder to diagnose.

## Implemented Optimisations
1. **Field extractor caching + trimming** (`app/lib/ai/agents/field-extractor-agent.ts`)
   - Trim history to user messages plus the last three assistant turns (max 12 messages) before calling the LLM.
   - Cache results by history signature and last user message; skip extraction when nothing changed or when required fields are already filled.
   - Default to Groq `llama-3.1-8b-instant` (configurable via `GROQ_EXTRACTOR_MODEL`) for materially faster turnaround while keeping deterministic rules.
2. **Sales agent context reduction** (`app/lib/ai/agents/sales-agent.ts`)
   - Limit tool-facing history to the last 12 non-system turns and clip long message bodies to 500 characters before JSON serialisation.
   - Add logging of history size and explicit early exit once the email tool succeeds, avoiding redundant steps.
3. **Frontend request slimming** (`app/components/Apps/Chatbot/Chatbot.tsx`)
   - Send the portfolio context system message only once per session (reset when chat is cleared).
   - Emit logs for send frequency, API payloads, and localStorage persistence to detect any accidental loops quickly.
   - Capture response metadata so we can correlate client timing with server-side `[PERF]` entries.

Together these changes remove ~1.5k repeated context tokens from every round trip, cut extractor/model cost dramatically, and ensure the sales agent operates on a compact working set.

## Additional Recommendations
1. **Run a live timing pass**: Execute the “I want a website” scenario and record the new per-phase numbers. Target is intent <400 ms, extraction <800 ms, sales agent <3 s.
2. **Cap agent step count in prompt**: Update `PROMPTS.SALES_AGENT` to emphasise collecting missing fields in ≤3 turns; re-run after logging new step counts.
3. **Persist server-side extraction state**: Store the cached extraction result in the client (or session storage) and send only deltas to avoid even the trimmed LLM call once fields are complete.
4. **Parallelise intent + extraction**: After validating current improvements, explore firing detector and extractor in parallel (Promise.all) to shave an extra ~300 ms.
5. **Token budget monitoring**: Add a guardrail that warns if `result.usage?.totalTokens` exceeds 1.2k so we can catch regressions early in telemetry.

## Old (`/api/chat`) vs New (`/api/chat-v2`) Architecture

| Area | `/api/chat` (legacy) | `/api/chat-v2` (before fixes) | `/api/chat-v2` (after fixes) |
| --- | --- | --- | --- |
| LLM calls per turn | Intent (router) + 1–3 linear calls | Intent + extractor every turn + multi-step agent (5 steps observed) | Same structure but extractor and agent run on trimmed history; agent stops immediately after email |
| Field tracking | Manual prompt state, re-extracts only when needed | Re-extracts full conversation every request | Cached extraction reused until new user info arrives |
| Model size defaults | 70B for router/extractor/validator | 70B for everything | Extractor downgraded to 8B (configurable); agent still 70B for quality |
| Payload size | Last 4 turns + minimal context | Entire chat + portfolio context on every call | Portfolio context sent once; backend trims history before LLM calls |
| Observability | Basic logging | High-level telemetry only | Detailed `[PERF]` logs + telemetry enriched with tokens/steps |

## Next Steps & Validation
- Deploy to a staging environment, run the full sales workflow, and paste the `[PERF]` log breakdown into this file for future baselining.
- Verify that cached extraction kicks in once name/email/projectType are captured (watch for log lines).
- Confirm token usage in telemetry dropped by ≥30 % (goal: <1,750 tokens per request).
- If latency is still above 5 s, investigate the longest `[PERF]` phase and adjust prompts/models accordingly.

All changes keep the existing API contract intact and can be toggled via environment variables (`GROQ_EXTRACTOR_MODEL`) if higher-accuracy models are required.
