# Claws: Alternative and Complementary OpenClaw Ecosystem

Updated: 2026-07-06
## Goals and Wants Alignment

- `W1` Improve runtime behavior (model routing, cost, reliability) while staying close to OpenClaw.
- `W2` Expand deployment options (local, VPS, Cloudflare, containerized).
- `W3` Improve security posture and credential handling.
- `W4` Identify reusable components with manageable maintenance burden.

## Evaluation Signals

- Maturity: architecture completeness, maintenance cadence, ecosystem usage.
- Liveness: recent pushes/updates.
- Community/Adoption: stars/forks/issues as rough public signal.
- Reuse risk: license clarity + coupling level + fork divergence.
- Freshness rule: use the latest observable public repo state by default (`pushedAt`, current metadata, visible license, current naming). Use stable-release comparison only when a project has a meaningful release train and the question is explicitly release-based.

## Reuse Opportunities and Challenges

Language and integration shape:

- TypeScript forks/variants (`DenchClaw`, `openclaw-composio`, `Clawdbot-Next`) are the highest-probability direct reuse path for OpenClaw-adjacent changes.
- Rust alternatives (`zeroclaw`) are best treated as architecture reference or service-level integration, not drop-in code reuse.
- Python ecosystems (`ClawWork`, `hermes-agent`) are strong for workflow ideas, agent UX, and external services, but require interface boundaries to avoid stack sprawl.
- Similar-goal adjacent work (`hermes-agent`, `fastclaw`, `Kai`, `AstrBot`) is useful for product and implementation comparison, but not for direct code lift.

Module profile and practical fit:

- Provider/model-routing modules (`@ai-sdk/*`, provider adapters) can be selectively lifted with moderate risk.
- Deployment modules (`@cloudflare/sandbox`, worker-specific runtime assumptions) are strong for infra patterns but not universally portable.
- Large end-to-end runtime frameworks (custom orchestrators, economy loops, full alternate cores) have high maintenance drag if imported directly.

License/SPDX implications:

- `MIT` and `Apache-2.0` are generally compatible with selective reuse under standard notice requirements.
- GitHub metadata `NOASSERTION` is not permission; it means SPDX certainty is unresolved from metadata.
- For `NOASSERTION` or missing SPDX cases, require manual `LICENSE` file validation before any code-level reuse.

## Area A: OpenClaw-Line Runtime Variants

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `DenchClaw` (`DenchHQ/DenchClaw`) | `W1 W3 W4` | TypeScript | `@ai-sdk/*` (OpenAI/Anthropic/Google/etc), provider adapters, `hono`, `zod`, `@mariozechner/pi-ai` | Medium-High | High (pushed 2026-04-07) | 1.5k stars / 100 forks | MIT, permissive. Real fork of `openclaw/openclaw`; currently the strongest OpenClaw-line public fork signal in this set. Replaces earlier `openclaw-ai-sdk` / `ironclaw` naming. Community surface is explicit and active: project Discord, `denchclaw.com`, and the `skills.sh` skills store. |
| `openclaw-composio` (`ComposioHQ/openclaw-composio`) | `W3 W4` | TypeScript | OpenClaw core deps + Composio integration path, `hono`, `zod`, `@mariozechner/pi-ai` | Low-Medium | Medium (pushed 2026-02-11) | 27 stars / 6 forks | MIT, permissive. Small footprint; clearer as an integration variant than as a broad OpenClaw alternative. |
| `Clawdbot-Next` (`cyrilliu1974/Clawdbot-Next`) | `W1 W4` | TypeScript + Docker | OpenClaw-like stack, custom prompt-engine framing (`ClawdMatrix`) | Low | Medium (pushed 2026-02-08) | 13 stars / 3 forks | MIT, permissive. Claims remain mostly README-level; benchmark before adopting ideas. |

## Area B: Deployment Complement

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `moltworker` (`cloudflare/moltworker`) | `W2 W3 W4` | TypeScript / Workers | `@cloudflare/sandbox`, `@cloudflare/puppeteer`, `hono`, React UI pieces | High | High (pushed 2026-03-29) | 9.79k stars / 1.78k forks | Apache-2.0; permissive with NOTICE/patent terms. Complementary infra path, not core fork. |

## Area B1: NemoClaw

`NemoClaw` (`NVIDIA/NemoClaw`) should be treated as a distinct deployment and security wrapper around OpenClaw, not as an OpenClaw-line fork.

Why it matters disproportionately:

- it originates at NVIDIA, so it carries unusually strong ecosystem visibility and implementation weight;
- it directly targets the most persistent and focused criticism of OpenClaw: security posture for always-on agents;
- its core proposition is not feature sprawl but tighter runtime containment through OpenShell, blueprints, policy layers, and managed inference wiring;
- it provides a practical reference for what a more tightly sandboxed/containerized OpenClaw operating model can look like.

Implementation shape:

- root package depends on `openclaw` `2026.3.11` as a dependency rather than presenting itself as a normal source fork;
- host-side CLI and orchestration live in `bin/`;
- an OpenClaw plugin lives in `nemoclaw/`;
- sandbox/blueprint and policy artifacts live in `nemoclaw-blueprint/`;
- onboarding and migration flows are built around creating and running a fresh OpenClaw instance inside OpenShell.

Current validated public state:

- project status `alpha`
- pushed `2026-04-02`
- 18.2k stars / 2.14k forks
- Apache-2.0

Practical classification:

- security/deployment complement to OpenClaw
- strong reference implementation for sandboxed/containerized operation
- important adjacent work even though it is not the right model for direct core-code reuse

## Area C: Adjacent / Alternative Runtime Tracks

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `zeroclaw` (`openagen/zeroclaw`) | `W1 W2` | Rust | `tokio`, `reqwest`, `matrix-sdk`, `axum`, `async-imap`, `lettre`, `serde` | Medium | High (pushed 2026-03-15) | 1.75k stars / 266 forks | Apache-2.0 on GitHub. Treat as a separate runtime track; GitHub also flags it as a fork, but it is not an OpenClaw-line drop-in candidate. |
| `ClawWork` (`HKUDS/ClawWork`) | `W1 W4` | Python | `fastapi`, `fastmcp`, `langchain`, `langgraph`, `langchain-openai`, `pandas`, `pyarrow` | Medium | High (pushed 2026-03-03) | 7.81k stars / 1.0k forks | MIT, permissive. Stronger public signal than earlier notes suggested; still best treated as pattern/reference rather than direct reuse. |

## Area D: Similar-Goal Adjacent Projects

| Repo | Fit | Language / Stack | Why It Matters | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `hermes-agent` (`NousResearch/hermes-agent`) | `W1 W2 W4` | Python | Direct OpenClaw alternative with unusually strong overlap in gateway shape: CLI + messaging gateway, skills, memory, cron, MCP, migration from OpenClaw, and broad channel coverage. Hermes also makes two personal-agent claims that are stronger and more explicit than upstream OpenClaw's current public posture: FTS5 session search with summarization for cross-session recall, and optional Honcho-based user modeling. Email support is materially broader than upstream OpenClaw's current Gmail-hook path: Hermes ships a built-in IMAP receive + SMTP send adapter (`gateway/platforms/email.py`) and also carries Gmail and Himalaya skills for API and mailbox operations. Strongest non-fork comparison target for feature posture and operator experience. | High | High (pushed 2026-04-07) | 31.5k stars / 4.09k forks | MIT. High comparison value; direct code lift still requires Python-to-TypeScript boundary decisions. Community surface is also clearer than many alternatives: Nous Research Discord for live discussion, plus GitHub Issues/Discussions for async project work. |
| `fastclaw` (`fastclaw-ai/fastclaw`) | `W1 W2` | Go | Similar direct positioning as a faster OpenClaw alternative; useful for product and runtime comparison. | Medium | High (pushed 2026-04-02) | 444 stars / 60 forks | MIT. Compare UX/runtime claims before drawing conclusions. |
| `Kai` (`SimonSchubert/Kai`) | `W1 W2` | Kotlin Multiplatform | Similar personal-agent goal with a mobile-first framing rather than OpenClaw's broader host/runtime model. Strong Android and cross-platform operator UX reference. | Medium | High (pushed 2026-04-02) | 350 stars / 39 forks | Apache-2.0. Useful for mobile-first operator experience reference. |
| `AstrBot` (`AstrBotDevs/AstrBot`) | `W1 W2 W4` | Python | The strongest adjacent scale signal for IM-centric agent infrastructure; useful to compare channel model, plugin surface, and operator UX. | High | High (pushed 2026-04-02) | 28.7k stars / 1.94k forks | AGPL-3.0. High reference value, but direct reuse has stronger copyleft implications. |

## Area E: Moltbook-Adjacent Ecosystem

| Repo | Fit | Language / Stack | Why It Matters | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `moltbook/api` | `W2 W4` | JavaScript / service backend | Core Moltbook backend; relevant if we treat Moltbook as an external social or coordination surface rather than an OpenClaw fork. | Medium | Medium (pushed 2026-02-01) | 69 stars / 107 forks | MIT. Ecosystem integration reference, not an OpenClaw variant. |
| `moltbook/agent-development-kit` | `W2 W4` | TypeScript, Swift, Kotlin | Useful if Moltbook becomes a target surface for agent publishing or interoperability. | Low-Medium | Medium (pushed 2026-02-01) | 8 stars / 25 forks | MIT. Small but relevant SDK surface. |
| `MoltBrain` (`nhevers/MoltBrain`) | `W1 W4` | TypeScript | Explicitly targets OpenClaw and MoltBook long-term memory, so it is relevant as an extension pattern rather than a fork. | Medium | High (pushed 2026-03-25) | 395 stars / 43 forks | AGPL-3.0 in the repo `LICENSE`; reference value is high, direct reuse is strongly constrained. |

## Article Claims vs Current Confidence

| Topic | Current Confidence | Notes |
|---|---|---|
| Strong OpenClaw adoption / fork volume | High | Confirmed by `openclaw/openclaw` scale. |
| Cloudflare deployment value (`moltworker`) | High | Confirmed by active repo and vendor documentation. |
| `NemoClaw` as OpenClaw security/deployment reference | High | Strong current public signal for a managed, more security-focused OpenClaw wrapper addressing the tight-container critique directly. |
| `hermes-agent` as the strongest non-fork OpenClaw alternative | High | Directly overlaps on gateway, skills, memory, cron, MCP, and channel breadth, ships OpenClaw migration support, and adds stronger explicit claims around FTS5 session search, self-improving skills, optional Honcho-based user modeling, and built-in IMAP/SMTP email support. |
| Token burn reduction claims in `Clawdbot-Next` | Medium-Low | Conceptually plausible; no reproducible benchmark package verified yet. |
| `DenchClaw` as practical OpenClaw-line fork | High | Real fork with active updates and the strongest current OpenClaw-line public signal in this set. |
| `AstrBot` as adjacent operator/chatbot runtime reference | High | Large active project; strong comparison target for channel/plugin/operator patterns. |
| ZeroClaw as high-performance local-first path | Medium | Separate runtime architecture, not drop-in compatibility. |

## Reuse and Legal Notes

- `MIT`: permissive; keep copyright/license notice.
- `Apache-2.0`: permissive + NOTICE/patent terms.
- `BSD-3-Clause` (not in `Claws`, relevant in `Emails`): permissive + no-endorsement clause.
- `NOASSERTION` or missing SPDX: treat as unknown until license files are explicitly reviewed.

## Local Clone List

There are 16 non-archival Git repositories in this directory. Fifteen are clean upstream clones at their tracked branch tips and are replaceable reference caches. `NemoClaw` is the exception.

| Class | Repositories | Local disposition |
|---|---|---|
| Focused working shelf | `NemoClaw`, `nanoclaw`, `zeroclaw`, `hermes-agent`, `ClawWork` | Retain while the OpenClaw/runtime comparison remains active. |
| Secondary comparisons | `AstrBot`, `Clawdbot-Next`, `DenchClaw`, `fastclaw`, `moltworker`, `MoltBrain` | Clean clones; remove and reclone when a specific comparison resumes. |
| Low-current-value integrations or adjacent SDKs | `Kai`, `openclaw-composio`, `agent-development-kit`, `api` | Clean clones; safe individual cleanup candidates. |
| Superseded historical comparison | `openclaw-ai-sdk` | Clean old naming/code line; remove once no citation or diff depends on it. |

`NemoClaw` requires rescue before clone cleanup:

- branch `nemow13` has no upstream tracking;
- local commit `24d5f3f` adds the authored 638-line `NemoClaw.md` assessment;
- `package-lock.json` has one uncommitted line adding the direct `ajv` dependency already present in `package.json`;
- preserve the branch through a personal fork or private Git bundle before replacing or updating the NVIDIA clone.

Largest clean reference clones in this directory are `ClawWork` (about 263 MB), `Kai` (about 167 MB), and `openclaw-ai-sdk` (about 115 MB). Their size is source/history or assets, not unique local work.

## Further Investigations

1. Build a reproducible benchmark harness (same tasks/prompts) for `openclaw` vs `DenchClaw` vs `Clawdbot-Next` vs `hermes-agent`.
2. Compare auth/secret boundary models: native OpenClaw vs Composio-integrated vs Cloudflare-hosted vs Moltbook-adjacent bridge patterns.
3. Map reusable units by effort level: direct lift, adapter wrap, or concept-only.
4. Track upstream drift for OpenClaw-line forks and estimate monthly rebase cost.
