# Anthropic and OpenClaw Notes

Last updated: 2026-02-23

## 1) Timeline: Claude/Anthropic auth handling changes in OpenClaw

- 2026-01-07: `7a917602c5f4002cba6d73ebb2cad7a62dd0fe1d`
  - Subject: `feat(auth): sync OAuth from Claude/Codex CLIs`
  - Added profile IDs for external CLI reuse:
    - `anthropic:claude-cli`
    - `openai-codex:codex-cli`
- 2026-01-26: `526303d9a2cf108308954639aa33a285fb8000f6`
  - Subject: `refactor(auth)!: remove external CLI OAuth reuse`
  - Removed Claude/Codex external CLI OAuth reuse from core auth flow.
- 2026-01-26: `000d5508aa64d7fdda25e8b902772ab879e5a237`
  - Subject: `docs(auth): remove external CLI OAuth reuse`
  - Docs aligned with new behavior.

Current docs statement:

- `docs/help/faq.md:706` says OpenClaw no longer reuses Claude Code CLI OAuth tokens; Anthropic should use setup-token or API key.

## 2) Current Anthropic auth model in OpenClaw

### Supported path

- `claude setup-token` is the subscription auth source token.
- OpenClaw stores it as a token credential (`type: "token"`) for provider `anthropic`.
  - See `src/commands/models/auth.ts:102`.

### Deprecated path handling

- Legacy `--auth-choice claude-cli` is normalized to setup-token flow:
  - `src/commands/auth-choice-legacy.ts:15`
  - `src/commands/onboard.ts:27`
- Doctor detects/removes deprecated external CLI profiles:
  - `anthropic:claude-cli` and `openai-codex:codex-cli`
  - `src/commands/doctor-auth.ts:112`
  - Constants: `src/agents/auth-profiles/constants.ts:7`

## 3) User-Agent handling (Anthropic-related)

### OpenClaw usage snapshot call

- Anthropic OAuth usage endpoint call:
  - `https://api.anthropic.com/api/oauth/usage`
  - Headers include:
    - `User-Agent: openclaw`
    - `anthropic-version: 2023-06-01`
    - `anthropic-beta: oauth-2025-04-20`
  - Code: `src/infra/provider-usage.fetch.claude.ts:121`

### Fallback when OAuth scope is insufficient

- If usage API returns 403 containing `scope requirement user:profile`, OpenClaw falls back to claude.ai web usage if sessionKey is available.
  - Code: `src/infra/provider-usage.fetch.claude.ts:149`

### Claude web usage fallback headers

- In production fallback code, claude.ai usage calls send:
  - `Cookie: sessionKey=<...>`
  - `Accept: application/json`
  - (no explicit `User-Agent` in this code path)
  - Code: `src/infra/provider-usage.fetch.claude.ts:71`

### Debug script behavior

- `scripts/debug-claude-usage.ts` sets:
  - `User-Agent: openclaw-debug` for OAuth usage endpoint calls
    - `scripts/debug-claude-usage.ts:86`
  - Safari-like browser UA for claude.ai web API checks
    - `scripts/debug-claude-usage.ts:304`

## 4) Auth/token storage locations and resolution

### Primary state and auth files

- State dir default: `~/.openclaw`
  - `src/config/paths.ts:58`
- Auth profiles file name: `auth-profiles.json`
  - `src/agents/auth-profiles/constants.ts:4`
- Default agent auth store path:
  - `~/.openclaw/agents/main/agent/auth-profiles.json`
  - Derived by:
    - `src/agents/agent-paths.ts:12`
    - `src/agents/auth-profiles/paths.ts:9`

### Legacy/import locations

- Legacy OAuth import file:
  - `~/.openclaw/credentials/oauth.json`
  - `src/config/paths.ts:250`
- On load, OAuth entries can be merged into auth profiles:
  - `src/agents/auth-profiles/store.ts:161`

### Env-based token sources (Anthropic)

- Environment lookup order for Anthropic:
  - `ANTHROPIC_OAUTH_TOKEN`
  - then `ANTHROPIC_API_KEY`
  - `src/agents/model-auth.ts:254`

### Claude web sessionKey inputs for usage fallback

- `CLAUDE_AI_SESSION_KEY`
- `CLAUDE_WEB_SESSION_KEY`
- `CLAUDE_WEB_COOKIE` (parses `sessionKey=...`)
- `src/infra/provider-usage.fetch.claude.ts:49`

### Claude Code credential location hints (debug helper)

- macOS keychain service read by helper:
  - `Claude Code-credentials`
  - `scripts/debug-claude-usage.ts:104`
- That helper inspects `claudeAiOauth.accessToken` + scopes in keychain JSON payload:
  - `scripts/debug-claude-usage.ts:108`

## 5) What identifies token ownership to Anthropic

- Practical model: ownership/usage attribution comes from the bearer credential (token/session), not from User-Agent alone.
- Swapping User-Agent can change client fingerprinting/signals, but does not transfer account ownership of token usage.

## 6) External captures of Claude Code User-Agent strings

Public issue captures (packet/proxy logs or request dumps) show strings like:

- `claude-cli/1.0.27 (external, cli)`
  - https://github.com/anthropics/claude-code/issues/2256
- `claude-cli/1.0.64 (external, cli)`
  - https://github.com/anthropics/claude-code-action/issues/377
- `claude-cli/2.0.29 (external, sdk-py, agent-sdk/0.1.6)`
  - https://github.com/anthropics/claude-agent-sdk-python/issues/335

## 7) Operator quick commands

Check current OpenClaw version:

```bash
node -p "require('./package.json').version"
```

Run release consistency checks:

```bash
node --import tsx scripts/release-check.ts
pnpm release:check
```

Inspect Anthropic usage/debug quickly:

```bash
node --import tsx scripts/debug-claude-usage.ts --agent main
```
