# OpenClaw Implementation Reference

This file is only for developers actively tuning, validating, or modifying the OpenClaw codebase.

It should capture implementation facts and runtime observations that affect code changes or technical validation.

It should not try to restate top-down strategy or hold the active work plan.

## 1. Runtime And Environment State

Release state last verified on `2026-04-04`:

- local workspace version: `2026.4.1`
- upstream latest stable release base: `2026.4.1`
- Homebrew cask metadata: `2026.3.28`
- installed Homebrew lane on this machine: `2026.3.7`

Runtime state last verified:

- active gateway runtime: repo profile on `127.0.0.1:19001`
- default/global gateway service on `18789`: not listening

Practical environment outcome:

- the project has a working repo-profile runtime under `~/.openclaw-repo`
- that environment is the concrete result of the OpenClaw-specific setup and testing work

## 2. Branch And Upgrade Notes

- repo lane target is met: `feat/more_mail` is on `v2026.4.1`
- docs lane is `claw_emails`
- remaining branch-maintenance task:
  - reconcile `origin/feat/more_mail` with the rewritten stable-based branch

Current local commit stack over `v2026.4.1`:

- `fix(skill): himalaya account flag is -a not --account`
- `Initial Anthropic relate patches`
- `show releases and QUIET`
- `Ignore local Codex session dirs`

## 3. Release Notes That Matter For Local Development

Operationally important releases from `2026.2.25` through `2026.4.1`:

- `2026.3.2`
  - loopback-only plaintext WebSocket policy by default
  - OpenAI Codex OAuth TLS preflight
  - more fail-closed hardening
- `2026.3.7`
  - `ContextEngine` plugin slot
  - refreshed model aliases
  - more config and remote-WS hardening
- `2026.3.8`
  - backup create and verify
  - `browser.relayBindHost`
  - Codex transport normalization
  - more SSRF and skill-download hardening
- `2026.3.31`
  - stricter proxy and local-direct auth handling
  - node commands gated behind approved node pairing
  - plugin install scan failures fail closed
- `2026.4.1`
  - chat-native `/tasks`
  - bundled SearXNG search provider
  - Bedrock Guardrails
  - Codex OAuth refresh-token persistence fixes

## 4. Verified Implementation Facts

### 4.1. Claude and Codex auth path reality

- `openclaw models auth login --provider openai-codex` currently goes through plugin-provider auth flow
- in this workspace state it fails with:
  - `No provider plugins found`
- working reauth path for OpenAI Codex OAuth is:
  - `openclaw --profile repo configure --section model`
  - or onboarding with `--auth-choice openai-codex`

Relevant files:

- `src/commands/models/auth.ts`
- `src/commands/configure.gateway-auth.ts`
- `src/commands/openai-codex-oauth.ts`

### 4.2. User-Agent and identity handling by path

`claude-cli` backend path:

- OpenClaw shells out to the `claude` binary
- OpenClaw does not set HTTP User-Agent in that path

Relevant files:

- `src/agents/cli-backends.ts`
- `src/agents/cli-runner.ts`

`anthropic` provider path through `pi-ai`:

- Anthropic OAuth path sets Claude-style identity headers

Relevant file:

- `node_modules/@mariozechner/pi-ai/dist/providers/anthropic.js`

`openai-codex` provider path through `pi-ai`:

- Codex responses path sets provider-specific identity headers and `OpenAI-Beta`

Relevant file:

- `node_modules/@mariozechner/pi-ai/dist/providers/openai-codex-responses.js`

### 4.3. Auth and token storage notes

- OpenClaw profile auth store:
  - `~/.openclaw-repo/agents/main/agent/auth-profiles.json`
- Codex CLI credential resolution includes macOS keychain service `Codex Auth`
- Codex default auth file:
  - `~/.codex/auth.json`
- Claude CLI credentials:
  - `~/.claude/.credentials.json`

Relevant file:

- `src/agents/cli-credentials.ts`

### 4.4. Gateway runtime behavior observed

- the artifact mismatch incident was runtime/process consistency, not compile failure
- cause pattern:
  - stale or duplicate gateway processes during hash-chunk changes in `dist`
- current healthy state:
  - one repo gateway listener at `19001`
  - no listener on `18789`

### 4.5. Release and update status path

- `scripts/release-status.ts` reads tags from the official upstream repo and combines them with npm publish times
- `src/cli/update-cli.ts` treats `openclaw update` as a channel-aware source or package-manager updater
- `src/commands/status.update.ts` reports both git drift and npm drift

Relevant files:

- `scripts/release-status.ts`
- `src/cli/update-cli.ts`
- `src/commands/status.update.ts`

### 4.6. ACP bridge summary

OpenClaw's ACP support is real, but specifically a Gateway-backed bridge model rather than a fully ACP-native runtime.

Operational summary:

- `openclaw acp` exposes an ACP agent over stdio
- it forwards prompts to a running OpenClaw Gateway over WebSocket
- ACP session ids are mapped onto Gateway session keys
- reconnect and reset behavior is built around that session-key mapping

Support posture:

- implemented:
  - `initialize`
  - `newSession`
  - `prompt`
  - `cancel`
  - `listSessions`
- partial:
  - `loadSession`
  - prompt resources and images
  - session-mode controls
  - session info and approximate usage updates
  - tool streaming
- unsupported:
  - per-session `mcpServers`
  - ACP client filesystem methods
  - ACP terminal methods
  - session plans and thought streaming

Canonical bridge detail remains in:

- `docs.acp.md`
- `docs/cli/acp.md`

### 4.7. Model usage visibility limits

What is built in:

- `session_status` gives current-session model/token state
- OpenClaw runtime and session surfaces can show active-model and session-level usage details
- ACP usage updates are best-effort from cached Gateway session snapshots

What is not built in as a robust product feature:

- arbitrary historical usage windows
- high-confidence cost history across all model paths inside one native OpenClaw report

Practical implication:

- session-local model visibility belongs in runtime surfaces
- historical or comparative usage analysis should be treated as sidecar or external-analysis work
