# Operational Context Discovery (OCD)

## Repeated Rediscovery

LLM coding tools keep running tools to rediscover same or similar facts or to simply answer a question:

- which binary is running: global `openclaw` vs `pnpm openclaw`.
- command --help information to select: `status --all`, `status --deep`, `gateway status --deep`.
- service/process state: launchd label, ports, running gateway.
- branch/base/version state: older docs branch vs upstream main.
- profile path behavior: `~/.openclaw` vs workspace paths.

Assembling one local digest reduces repeated probing and token usage.

## Current Snapshot (example)

Captured: `2026-02-12T08:14:25Z`

- Directory: `/Users/walter/Work/Claw/openclaw-docs`
- Branch: `ai_email`
- Shell: `/bin/zsh`
- OS: `macOS 15.5` (`arm64`)
- Node: `v22.18.0`
- pnpm: `10.23.0`
- Global `openclaw --version`: `2026.2.9`
- Upstream main repo `package.json` version: `2026.2.10`
- Gateway launchd label: `none`
- default listener `18789`: `0`
- dev repo listener `19001`: `0`

## What to Capture

Upon install

- Runtime platform: OS, arch, shell.
- Canonical command map: which status/help command answers which question.
- Repo identity: path, branch, head commit, repo package version.

Update on each code or tools refresh

- Toolchain: Node, pnpm.
- Install mode: global binary path and version vs repo-run version.
- Global and repo CLI version.

Update on each relaunch

- Service state: launchd labels, running PIDs, active ports.
- Profile state roots: config path, state dir, workspace dir for active profile.

## Example regenerate command for all parameters

```bash
{
  echo "# Operational Context Digest (OCD)"
  echo
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "## Runtime"
  echo "- Directory: $(pwd)"
  echo "- Branch: $(git rev-parse --abbrev-ref HEAD)"
  echo "- Shell: ${SHELL:-unknown}"
  echo "- OS: $(sw_vers -productName 2>/dev/null) $(sw_vers -productVersion 2>/dev/null) ($(uname -m))"
  echo
  echo "## Toolchain"
  echo "- Node: $(node --version 2>/dev/null || echo n/a)"
  echo "- pnpm: $(pnpm --version 2>/dev/null || echo n/a)"
  echo "- Global openclaw: $(openclaw --version 2>/dev/null || echo n/a)"
  echo "- Repo package version: $(node -p \"require('./package.json').version\" 2>/dev/null || echo n/a)"
  echo
  echo "## Service State"
  echo "- launchd labels:"
  launchctl list | rg -i 'ai\\.openclaw\\.gateway|bot\\.molt\\.gateway|ai\\.openclaw\\.mac' || echo "none"
  echo "- listening ports:"
  echo "  - 18789: $(lsof -nP -iTCP:18789 -sTCP:LISTEN | tail -n +2 | wc -l | tr -d ' ')"
  echo "  - 19001: $(lsof -nP -iTCP:19001 -sTCP:LISTEN | tail -n +2 | wc -l | tr -d ' ')"
  echo
  echo "## Command Map"
  echo "- gateway runtime/service: openclaw gateway status --deep"
  echo "- full local diagnosis: openclaw status --all"
  echo "- channel probes: openclaw status --deep"
} > OCDigest.md
```

## Prompt reinsert pattern

Start of session prompt:

```text
Read OCDigest.md first, then Plan.md.
Use OCDigest.md values as default environment truth unless stale.
If stale or missing required fields, regenerate OCD.md before running operational commands.
```

Mid-session reset prompt:

```text
Context reset: re-read OCDigest.md and continue from current local environment state.
Do not rediscover basics already recorded unless they are stale.
```

## Naming choice

- `OCDigest.md` is concise and memorable.
- `ENV.md` is generic
- `SYSTEM.md` sounds broad
- `SETUP.md` usually describes installation steps
- `LOCAL.md` is reasonable, but less explicit about operational diagnostics.

Recommended split:

- `OCDigest.md`: current machine/runtime snapshot and command map.
- `Plan.md`: tasks/TODO/Postponed.
- `AGENTS.md` and `STYLE.md`: project and developer behavior rules and writing/interaction policy.
