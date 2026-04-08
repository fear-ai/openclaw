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
- [x] Record current delta: local source lane `2026.4.1`, current Homebrew cask `2026.3.28`, installed Homebrew lane `2026.3.7`.
- [x] Review security-significant changelog deltas from `2026.2.26` through `2026.4.1`.
- [x] Rebase `feat/more_mail` onto `v2026.4.1`.
- [x] Create `claw_emails` as the small docs branch on `v2026.4.1`.
- [ ] Reconcile `origin/feat/more_mail` with the rewritten local stable-based branch.
- [ ] Update the installed Homebrew lane from `2026.3.7` to current cask metadata.

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

## 2.7. Comparative review -> implementation decision track

- [x] Decide provisional base for the next several iterations:
  - stay on `OpenClaw`
  - use `Hermes` as an active comparison target rather than a migration target
- [ ] Review `NemoClaw` actions and extract immediately applicable security/deployment ideas.
- [ ] Review `DenchClaw` CRM and DuckDB/workspace model for sidecar-schema implications.
- [ ] Review `Hermes` Honcho integration in enough detail to capture why the Hermes team chose it over a simpler local memory-only path.
- [ ] Follow up with Hermes community on:
  - Honcho tradeoffs,
  - real use of built-in IMAP/SMTP,
  - how much of the self-improving path is prompt/tool convention versus stronger mechanism.
- [ ] Follow up with DenchClaw community on:
  - fork maintenance cost,
  - CRM schema stability,
  - which parts are intended as reusable primitives versus product-specific code.

## 2.8. Maildir and sidecar implementation track

- [ ] Finalize the first serious Maildir ingest candidate for current testing:
  - `neverest`
  - `getmail6`
  - or `mbsync`
- [ ] Define the initial replay/reprocess path:
  - `notmuch`-backed first pass
  - or custom OpenClaw-side indexing first
- [ ] Capture the minimum sidecar entity set before overloading Maildir filename/folder state:
  - accounts/providers
  - conversations/threads
  - messages
  - participants
  - mailbox membership
  - flags/status
  - provider-specific metadata
  - local policy/classification state
  - action/audit history
- [ ] Decide the first display boundary:
  - Himalaya-backed interaction
  - direct OpenClaw Maildir adapter
  - or hybrid
- [ ] Define the first prioritization and blocking rule set for replayed Maildir history.

## 3. Promotion Gates

A phase promotion requires all of:

1. no critical `openclaw security audit --deep` findings,
2. runtime/channel/model health checks passing,
3. rollback path tested,
4. decision updates recorded in docs.

## 4. Immediate Next Actions (ordered)

1. Complete Codex OAuth reauth through configure model section.
2. Verify post-reauth model/runtime health and reconnect behavior.
3. Push the rewritten `feat/more_mail` branch to `origin` with an intentional `--force-with-lease` after review.
4. Upgrade the installed Homebrew lane, then verify stock and repo behavior in both lanes.

## 5. Review Sequence

Near-term review order:

1. `NemoClaw`:

- security/deployment hardening ideas worth applying without adopting the full NVIDIA stack.

2. `DenchClaw`:

- structured workspace, DuckDB, documents, reports, CRM entity patterns, and lift-versus-copy boundaries.

3. `Hermes` / Honcho:

- user-modeling goals, memory boundary choices, and what is actually gained by the Honcho dependency.

4. Maildir implementation decision:

- choose first serious ingest path
- choose first reprocessing/index direction
- define first sidecar schema sketch
