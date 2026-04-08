# OpenClaw OSS Implementation Reference

## 1. Scope

This file records implementation facts and high-signal release deltas only.

Document roles for this set are defined in `Claw.md` §5.

## 2. Release and Runtime Snapshot

Release state (verified 2026-04-04):

- Local workspace version (`/Users/walter/Work/Claw/openclaw/package.json`): `2026.4.1`
- Upstream latest stable release base: `2026.4.1`
- Homebrew cask current version: `2026.3.28`
- Installed Homebrew lane on this machine: `2026.3.7`
- Local source lane is aligned to current stable; stock Homebrew remains behind.

Runtime state (last verified 2026-03-06):

- Active gateway runtime: repo profile on `127.0.0.1:19001` (PID observed `20761`)
- Default/global gateway service on `18789`: not listening

## 3. Release and Changelog Delta Notes

## 3.1. 2026.2.25 -> 2026.4.1 trend

- Release intake since `2026.2.25` continued to concentrate on safer upgrades, stricter gateway and browser boundaries, and current-model/provider compatibility.
- High-signal themes for this workspace are:
  - update and rollback safety,
  - browser and remote gateway hardening,
  - Codex and current provider compatibility,
  - task/runtime surfaces that keep more work inside the chat and gateway plane,
  - more explicit validation of config and auth prerequisites.

## 3.2. High-signal release items for current operations

- `2026.3.2`:
  - loopback-only plaintext WebSocket policy by default, with explicit break-glass override for private-network WS,
  - OpenAI Codex OAuth TLS cert-chain preflight and narrower doctor probing,
  - additional fail-closed security hardening around node fetches, skills workspace boundaries, and safe writes.
- `2026.3.7`:
  - `ContextEngine` plugin slot and bootstrap path, with no behavior change unless configured,
  - default alias refresh to current model IDs including `openai/gpt-5.4`,
  - more hardening around invalid config handling, remote WS behavior, and security response headers.
- `2026.3.8`:
  - `openclaw backup create` and `openclaw backup verify`,
  - `browser.relayBindHost` for WSL2 and other cross-namespace relay setups,
  - `openai-codex/gpt-5.4` transport normalization and corrected token-window limits,
  - additional hardening for SSRF redirect chains, `system.run`, and skill-download write boundaries.
- `2026.3.31`:
  - stricter `trusted-proxy` and local-direct auth handling,
  - node commands gated behind approved node pairing,
  - plugin install scan failures now fail closed by default,
  - tighter plugin-auth and webhook route scoping.
- `2026.4.1`:
  - chat-native `/tasks`,
  - bundled SearXNG web search provider,
  - Bedrock Guardrails support,
  - OpenAI Codex OAuth refresh-token persistence fixes and related runtime/auth recovery work.

## 3.3. Upgrade target conclusion

- Repo lane target is already met: `feat/more_mail` now sits on `v2026.4.1`.
- Current local commit stack over `v2026.4.1` is:
  - `fix(skill): himalaya account flag is -a not --account`
  - `Initial Anthropic relate patches`
  - `show releases and QUIET`
  - `Ignore local Codex session dirs`
- The docs lane is now `claw_emails`, a small project-doc branch based on `v2026.4.1`.
- The remaining branch-maintenance task is remote reconciliation: `origin/feat/more_mail` still reflects the old ancestry and needs one intentional `push --force-with-lease` after review.

## 4. Verified Implementation Facts

## 4.1. Claude/Codex auth command path reality

- `openclaw models auth login --provider openai-codex` currently goes through plugin-provider auth flow.
- On this workspace, that command fails with: `No provider plugins found`.
- Working reauth path for OpenAI Codex OAuth is the configure/onboard model flow:
  - `openclaw --profile repo configure --section model`
  - (or onboarding with `--auth-choice openai-codex`)

Key files:

- `src/commands/models/auth.ts`
- `src/commands/configure.gateway-auth.ts`
- `src/commands/openai-codex-oauth.ts`

## 4.2. User-Agent and identity handling by path

### A) `claude-cli` backend path

- OpenClaw shells out to the `claude` binary.
- OpenClaw does not set HTTP User-Agent in this path; Claude CLI controls network headers.

Key files:

- `src/agents/cli-backends.ts`
- `src/agents/cli-runner.ts`

### B) `anthropic` provider path (`pi-ai`, the underlying provider/runtime library)

- For Anthropic OAuth tokens (`sk-ant-oat...`), pi-ai sets Claude-style identity headers:
  - `user-agent: claude-cli/2.1.2 (external, cli)`
  - `x-app: cli`
  - `anthropic-beta: claude-code-20250219,oauth-2025-04-20,...`

Key file:

- `node_modules/@mariozechner/pi-ai/dist/providers/anthropic.js`

### C) `openai-codex` provider path (pi-ai)

- Codex responses path sets:
  - `User-Agent: pi (<os> <release>; <arch>)`
  - `originator: pi`
  - `chatgpt-account-id` from token claims
  - `OpenAI-Beta: responses=experimental`

Key file:

- `node_modules/@mariozechner/pi-ai/dist/providers/openai-codex-responses.js`

## 4.3. Auth/token storage and precedence notes

- OpenClaw profile auth store: `~/.openclaw-repo/agents/main/agent/auth-profiles.json`
- Codex CLI credential resolution includes macOS keychain service `Codex Auth` keyed by hashed `CODEX_HOME` account.
- Codex home auth file path resolver: `~/.codex/auth.json` (default)
- Claude CLI credential path resolver includes `~/.claude/.credentials.json`

Key file:

- `src/agents/cli-credentials.ts`

## 4.4. Gateway service behavior observed

- Artifact mismatch incident was runtime/process consistency, not compile failure.
- Cause pattern: stale/duplicate gateway processes during hash-chunk changes in `dist`.
- Current healthy state:
  - one repo gateway listener at `19001`,
  - no listener on `18789`.
- Remaining warning is advisory:
  - service uses node path under nvm; could break after node-manager changes.

## 4.5. Release/update status path

- `scripts/release-status.ts` reads tags from the official `https://github.com/openclaw/openclaw.git` repository and combines them with npm publish times, so the latest stable value is not coming from the fork remotes.
- `src/cli/update-cli.ts` documents `openclaw update` as a channel-aware source or package-manager updater, with clean-worktree behavior and optional channel switching.
- `src/commands/status.update.ts` reports both git ahead or behind state and npm latest version, which is why repo drift and package drift can be assessed together.

Key files:

- `scripts/release-status.ts`
- `src/cli/update-cli.ts`
- `src/commands/status.update.ts`

## 5. Operational Commands (current runbook)

Release tracking:

```bash
pnpm -C /Users/walter/Work/Claw/openclaw -s release:status -- --limit=5
```

GitHub account helper for the Claw worktree set:

```bash
/Users/walter/Work/Claw/github-account.sh wkarshat tearodactyl /Users/walter/Work/Claw
```

This script sets the default GitHub username and writes a `gitdir:/Users/walter/Work/Claw/` include override so the Claw repos can use a separate GitHub account profile.

Homebrew stock-lane upgrade:

```bash
brew update
brew upgrade --cask openclaw
openclaw doctor
openclaw gateway restart
openclaw health
```

Branch-safe stable-lane maintenance:

```bash
git -C /Users/walter/Work/Claw/openclaw fetch upstream --tags
git -C /Users/walter/Work/Claw/openclaw rebase v2026.4.1
pnpm -C /Users/walter/Work/Claw/openclaw install
pnpm -C /Users/walter/Work/Claw/openclaw build
pnpm -C /Users/walter/Work/Claw/openclaw ui:build
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo doctor
git -C /Users/walter/Work/Claw/openclaw push --force-with-lease origin feat/more_mail
```

Docs-lane maintenance should stay separate: keep `claw_emails` as the small project-doc branch on top of the chosen stable release base rather than replaying the retired `ai_email` history.

Codex OAuth reauth (current reliable path):

```bash
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo configure --section model
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo gateway restart
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo models status --json
```

Safe build-restart sequence after dist changes:

```bash
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo gateway stop
pnpm -C /Users/walter/Work/Claw/openclaw build
pnpm -C /Users/walter/Work/Claw/openclaw ui:build
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo gateway start
```

## 6. External References

Official:

- OpenClaw stable release:
  - `https://github.com/openclaw/openclaw/releases/tag/v2026.4.1`
- OpenClaw updating guide:
  - `https://docs.openclaw.ai/install/updating`
- OpenClaw update CLI reference:
  - `https://docs.openclaw.ai/cli/update`
- Homebrew cask page:
  - `https://formulae.brew.sh/cask/openclaw`
- Anthropic legal/compliance page (Claude Code auth scope restrictions):
  - `https://code.claude.com/docs/en/legal-and-compliance`
- OpenClaw FAQ (no Claude Code CLI OAuth reuse statement):
  - `https://docs.openclaw.ai/help/faq`

Community evidence (informational, not policy authority):

- Header capture discussion with Claude-style UA examples:
  - `https://github.com/musistudio/claude-code-router/issues/341`

## 7. Known Limitations

- `node_modules/@mariozechner/pi-ai` behavior is dependency-state dependent; re-check after dependency updates.
- Local source workspace is now on the current stable release base, but the stock Homebrew installation on this machine still trails both current npm and current Homebrew cask metadata.
- `models auth login --provider openai-codex` behavior may change if provider-plugin architecture changes in upcoming releases.
