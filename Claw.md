# OpenClaw: Program Orientation and Direction

## 0. Operating Context and Document Ownership

This project currently runs across two parallel worktree directories with different purposes:

1. `/Users/walter/Work/Claw/openclaw`

- upstream OpenClaw source worktree
- current source branch: `feat/more_mail`
- used for incremental code and configuration changes
- repo-driven runtime/testing lane uses `pnpm openclaw`
- repo-specific profile location: `~/.openclaw_repo`
- in that profile, `openclaw.json` points `workspace` at `/Users/walter/.openclaw-repo/workspace`

2. `/Users/walter/Work/Claw/openclaw-docs`

- project documentation worktree
- current docs branch: `ai_email`
- used for strategy, findings, security framing, plans, and project synthesis

In parallel, stock-release behavior and external connection testing are also performed against the Homebrew-installed `openclaw` command using the default profile location. That stock lane must be kept distinct from the repo-development lane above.

Document ownership is split deliberately:

- OpenClaw team files are upstream-owned reference and control materials.
- We consult them regularly, but we do not modify them in normal project work.
- Changes to upstream-owned files, including files such as `AGENTS.md`, `README.md`, and the standard OpenClaw docs tree, require a strong reason and explicit Developer approval.
- Our maintained project documents are the root project files in this docs worktree, especially `Claw.md`, `Code.md`, `Sec.md`, `Plan.md`, and related project-specific notes.

## 1. Purpose

`Claw.md` is the strategy and decision entry point for this workspace. It captures current understanding, accepted decisions, and near-term direction.

Implementation facts live in `Code.md`. Security posture and mitigations live in `Sec.md`. Execution tasks live in `Plan.md`.

## 2. Current Understanding (2026-03-10)

OpenClaw is now best treated as a policy-and-runtime control plane, not only a chat bridge.

Current practical state:

- local development remains fast and viable,
- runtime safety depends on strict policy and service hygiene,
- provider/auth landscape is dynamic and requires frequent verification.

The local worktree is on `2026.2.25` while upstream stable is `2026.3.8` (dated `2026-03-09`). The stock Homebrew lane currently exposes `2026.3.7`, so release tracking must keep the stock and repo lanes distinct.

## 3. Program-Level Decisions

## 3.1. Decision: Keep hybrid operating model

We continue with:

1. local-first code edit/build/debug loop,
2. explicit controlled runtime launch lane,
3. progressive move to stronger runtime isolation.

Reason:

- preserves throughput while containing runtime risk.

## 3.2. Decision: Maintain lane partition by range of impact

1. `ops-main`:

- coding, docs, shell, model switching, web search, email.

2. `comms-bot`:

- Discord/Telegram operations with constrained tool surface.

3. `av-browser` (future):

- AV devices, browser automation, broader chat/service access, default disabled until gated.

## 3.3. Decision: Auth/provider path must be explicit

- For OpenAI Codex OAuth in this build, use configure/onboard model flows (not plugin-login command path).
- Treat Claude-related access as two separate paths:
  - `claude-cli` backend (headers controlled by Claude CLI itself),
  - Anthropic provider path (headers/tokens handled via OpenClaw + pi-ai).

This split matters for reliability, compliance, and troubleshooting.

## 3.4. Decision: Service hygiene is mandatory

- Keep one active gateway service for daily operation (`repo` profile on `19001`).
- Avoid concurrent default/global service unless intentionally needed.
- Use build-stop-start sequence after artifact rebuilds to avoid stale chunk/runtime mismatches.

## 4. Ongoing and Future Aspirations

## 4.1. Near-term

- Complete reliable Codex OAuth reconnect through the current supported command path.
- Keep model switching healthy between default and fallback providers.
- Continue upstream intake and patch adoption with explicit risk review.

## 4.2. Mid-term

- Complete dedicated runtime user boundary and sandbox-first runtime posture.
- Move runtime to remote host with controlled local operator/node interaction.
- Keep local dev lane for active OpenClaw code work.

## 4.3. Long-term

- Enable AV/browser lane under explicit policy and transport controls.
- Expand integrations without weakening trust boundaries.
- Maintain evidence-backed decision logs in this docs branch.

## 5. Document Map Preamble and Boundaries Between Documents

Single-source documentation: the full documentation body should optimize for clarity, accessibility, progressive exposure, and rapid learning; it should carry high information density without unnecessary repetition.

Rules:

1. Each major subject gets one canonical section or subsection that groups the relevant material.
2. The documentation may expose the reader to the same subject at increasing levels of complexity and technical knowledge, but redundancy is not accepted.
3. Earlier in the same file may contain one tight forward reference to the canonical section for a subject.
4. Other files may include only a narrow context-specific mention, or an explicit reference to the relevant named and numbered section/subsection.
5. `Claw.md` owns the document map for this project documentation set.
6. Other project files must not duplicate the document map or repeat parallel lists of the same structure.
7. When a specific industry or scientific term first appears, add a short explanation.
8. For idiomatic or multi-term expressions, introduce the full phrase first and add an abbreviation in parentheses for later use, for example `User Experience (UX)`.

- `Claw.md`: strategy, decisions, trajectory.
- `Code.md`: verified implementation facts, release deltas, runtime observations, and commands justified by evidence.
- `Sec.md`: threat posture, mitigations, accepted security range, and security-gated transition criteria.
- `Plan.md`: branch-wide active work, sequencing, gates, and next actions.
- `Email.md`: canonical email-domain document for architecture, validation status, options, terminology, and substantive Email-project planning when keeping it there improves usability. It does not own the branch-wide execution order or promotion gates.

## 6. References

OpenClaw + related references:

- `https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md`
- `https://docs.openclaw.ai/help/faq`
- `https://docs.openclaw.ai/gateway/security`
- `https://docs.openclaw.ai/gateway/remote`
- `https://docs.openclaw.ai/gateway/sandboxing`
- `https://docs.openclaw.ai/gateway/trusted-proxy-auth`

External policy reference:

- `https://code.claude.com/docs/en/legal-and-compliance`

## 7. Immediate Direction

Execution details and next actions are tracked in `Plan.md`; security acceptance criteria remain in `Sec.md`.
