# OpenClaw Execution Plan

## Purpose

This is the active planning document for the OpenClaw side of the project.

It should contain only forward-looking directions and planning steps for:

- configuring the OpenClaw environment
- testing it
- expanding it
- hardening it
- integrating it with the deeper message-handling work

It should not carry generic product methodology or long-form implementation reference material.

## Current Target State

The current intended OpenClaw environment outcome is:

- a working repo-profile runtime under `~/.openclaw-repo`
- one active repo gateway listener on `127.0.0.1:19001`
- no active default/global listener on `18789`
- a stable enough local environment to exercise fetch, display, and action boundaries

That target state should be treated as the base environment for the next several iterations.

## Active Workstreams

### 1. Docs and environment alignment

- Remove stale references to retired or renamed docs across the OpenClaw set.
- Keep the active OpenClaw documents mutually consistent.
- Keep non-OpenClaw product design out of the OpenClaw document set.

### 2. Release intake and upstream tracking

- Reconcile `origin/feat/more_mail` with the rewritten stable-based branch.
- Update the installed Homebrew lane from `2026.3.7` to current cask metadata.
- Keep release-sensitive local implementation notes current enough to support branch and environment decisions.

### 3. Auth and model continuity

- Re-auth OpenAI Codex via the supported path:
  - `openclaw --profile repo configure --section model`
- Verify `models status --json` shows healthy non-stale `openai-codex` profile status.
- Validate model-switch and reconnect behavior after reauth.
- Decide preferred Claude production path:
  - `claude-cli` backend
  - or Anthropic provider path

### 4. Runtime service hygiene

- Keep only the repo gateway active on `127.0.0.1:19001`.
- Keep the default/global listener on `18789` inactive unless deliberately reintroduced.
- Optionally reinstall the gateway service using a stable non-nvm node path.
- Optionally run `openclaw --profile repo doctor --repair` and review resulting service-config diffs.

### 5. Security and deployment hardening

- Complete capability-matrix enforcement for `ops-main` versus `comms-bot`.
- Re-run `openclaw security audit --deep` and capture pass/fail plus fixes.
- Review `NemoClaw` actions and extract immediately applicable hardening ideas.
- Decide which `NemoClaw` ideas belong in code, config, or operating procedure.

### 6. Comparison review feeding implementation

- Review `DenchClaw` CRM and DuckDB/workspace model for sidecar-schema implications.
- Review `Hermes` Honcho integration deeply enough to capture why the Hermes team chose it.
- Follow up with the Hermes community on:
  - Honcho tradeoffs
  - real use of built-in IMAP/SMTP
  - how much of the self-improving path is prompt/tool convention versus stronger mechanism
- Follow up with the DenchClaw community on:
  - fork maintenance cost
  - CRM schema stability
  - which parts are intended as reusable primitives versus product-specific code

### 7. Email integration testing and boundary work

- Validate the Gmail-native path with `gog` as the first OpenClaw-facing email integration path.
- Verify and expose the richer `gog` Gmail hook fields already available upstream:
  - `historyId`
  - `deletedMessageIds`
  - `threadId`
  - `to`
  - `date`
  - `labels`
  - `bodyTruncated`
- Run mailbox-interaction tests with `himalaya` as the secondary interaction layer.
- Use the current repo-profile environment under `~/.openclaw-repo` as the place where those integration tests are exercised and recorded.
- Decide whether the first usable display boundary is:
  - `gog`-native for Gmail only
  - `himalaya` on top of Maildir
  - or a hybrid
- Finalize the first serious Maildir ingest candidate:
  - `neverest`
  - `getmail6`
  - or `mbsync`
- Define the initial replay/reprocess path:
  - `notmuch`-backed first pass
  - or custom indexing first
- Capture the minimum sidecar entity set before overloading Maildir filename or folder state:
  - accounts/providers
  - conversations/threads
  - messages
  - participants
  - mailbox membership
  - flags/status
  - provider-specific metadata
  - local policy/classification state
  - action/audit history
- Keep the canonical email-substrate reference current enough to support the OpenClaw-facing boundary decisions.

## Near-Term Sequence

1. Finish the remaining OpenClaw-doc cleanup and retire the obsolete files.
2. Push the rewritten `feat/more_mail` branch to `origin` with intentional `--force-with-lease`.
3. Review `NemoClaw`.
4. Review `DenchClaw`.
5. Review `Hermes` and Honcho.
6. Validate `gog` and `himalaya` email integration paths inside the repo-profile environment.
7. Commit to the first Maildir ingest and replay path.

## Review Order

1. `NemoClaw`
   - security and deployment hardening ideas worth applying without adopting the full stack
2. `DenchClaw`
   - workspace, DuckDB, documents, and CRM entity patterns worth lifting
3. `Hermes` / Honcho
   - user-modeling goals, memory boundary choices, and what is actually gained by the Honcho dependency
4. Email integration sequence
   - `gog`
   - `himalaya`
   - Maildir ingest and replay choice

## Appendix: Operational Context Digest Practice

Repeated sessions still waste time rediscovering the same local operational facts:

- which binary is being exercised: global `openclaw` or repo-profile `pnpm openclaw`
- which command gives the needed status view
- what listener or service is currently active
- which profile path is active
- which branch, repo version, and install mode are in play

Future direction:

- keep a lightweight local operational digest outside the committed docs set
- refresh it after upgrades, branch changes, profile changes, gateway relaunches, and toolchain refreshes
- use it to reduce repeated probing before operational work

The digest, if maintained locally, should answer:

- where the session is running
- which branch and repo version are active
- which toolchain versions are active
- which OpenClaw binary paths and versions are in use
- which gateway listener and service state are active
- which profile and workspace paths are active
- which commands answer the common status questions

Example regenerate command:

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
}
```

Prompt pattern:

```text
Read the current local operational digest first.
Use it as default local environment truth unless it is stale.
If it is stale or missing required fields, regenerate it before running operational commands.
```
