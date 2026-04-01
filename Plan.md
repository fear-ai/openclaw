# Documentation and Transition Plan

## 1. Purpose

This is the source of truth for active work items, execution order, and promotion gates for this docs branch.

## 2. Current Workstreams

## 2.1. Documentation alignment (current cycle)

- [x] Refresh `Code.md` with latest code/changelog/runtime findings.
- [x] Refresh `Claw.md` with current direction.
- [x] Refresh `Sec.md` with current threat and mitigation posture.
- [x] Keep substantive Email-project planning in `Email.md`.
- [x] Update `Checkpoint.md` for restart continuity.

## 2.2. Release intake and upstream tracking

- [x] Run release status script against upstream official repo.
- [x] Record current delta: local `2026.2.25`, upstream stable `2026.3.8` (2026-03-09), Homebrew cask `2026.3.7`.
- [x] Review security-significant changelog deltas from `2026.2.26` through `2026.3.8`.
- [ ] Decide upgrade window and execute controlled merge/update in both repos.

## 2.3. Auth and model continuity

- [ ] Re-auth OpenAI Codex via supported path:
  - `openclaw --profile repo configure --section model`
- [ ] Verify `models status --json` shows healthy/non-stale openai-codex profile status.
- [ ] Validate model switch/reconnect behavior post-reauth.
- [ ] Decide preferred Claude path for production use:
  - `claude-cli` backend vs Anthropic provider path.

## 2.4. Runtime service hygiene

- [x] Keep only repo gateway active on `127.0.0.1:19001`.
- [x] Confirm no active listener on `18789`.
- [ ] Optional: reinstall gateway service using stable non-nvm node path.
- [ ] Optional: run `openclaw --profile repo doctor --repair` and review resulting service config diffs.

## 2.5. Track A: Harden current installation

- [x] Baseline evidence captured (`status`, `models`, `gateway status`).
- [x] Loopback bind and explicit auth mode in place.
- [x] `av-browser` lane remains disabled.
- [ ] Complete capability matrix enforcement for `ops-main` vs `comms-bot` tool policies.
- [ ] Re-run `openclaw security audit --deep` and log pass/fail with fixes.

## 2.6. Track B/C/D transition (pending)

- [ ] Dedicated runtime user boundary.
- [ ] Sandbox phased rollout.
- [ ] Remote-first runtime shift.

## 3. Promotion Gates

A phase promotion requires all of:

1. no critical `openclaw security audit --deep` findings,
2. runtime/channel/model health checks passing,
3. rollback path tested,
4. decision updates recorded in docs.

## 4. Immediate Next Actions (ordered)

1. Complete Codex OAuth reauth through configure model section.
2. Verify post-reauth model/runtime health and reconnect behavior.
3. Decide and schedule controlled rebases of `feat/more_mail` and `ai_email` onto `upstream/main`.
4. Execute the repo-lane update to `2026.3.8` and the Homebrew stock-lane update to `2026.3.7`, then verify behavior in both lanes.
