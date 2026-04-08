# Session Checkpoint

Updated: 2026-04-04

## 1. Current State

- OpenClaw repo:
  - path: `/Users/walter/Work/Claw/openclaw`
  - branch/head: `feat/more_mail` @ `305a83bfad`
  - local package version: `2026.4.1`
- Docs repo:
  - path: `/Users/walter/Work/Claw/openclaw-docs`
  - branch/head: `claw_emails` @ `b1ef8555ad`

## 2. Runtime Snapshot

- Active gateway listener: `127.0.0.1:19001` (repo profile)
- Active PID observed: `20761`
- Default/global listener (`18789`): none
- Gateway health: running + RPC probe ok (last checks this session)

## 3. Docs Updated This Cycle

- `Code.md`
- `Claw.md`
- `Email.md`
- `Sec.md`
- `Plan.md`
- `Checkpoint.md`

## 4. Key Findings Captured

1. Local source lane is now on `2026.4.1`, while the installed Homebrew stock lane on this machine remains at `2026.3.7`.
2. OpenAI Codex reauth path is `configure --section model` in current workspace behavior.
3. Claude/Codex user-agent handling differs by provider path and is now documented in `Code.md`.
4. Runtime artifact mismatch issue was process/runtime consistency, not build failure.
5. `feat/more_mail` has now been rebased onto `v2026.4.1`; the remaining branch-maintenance task is reconciling the remote branch with the rewritten stable-based local history.
6. Homebrew cask metadata is now `2026.3.28`, but the installed stock lane on this machine is still `2026.3.7`.

## 5. First Commands on Resume

```bash
git -C /Users/walter/Work/Claw/openclaw status -sb
git -C /Users/walter/Work/Claw/openclaw-docs status -sb
pnpm -C /Users/walter/Work/Claw/openclaw -s release:status -- --limit=5
pnpm -C /Users/walter/Work/Claw/openclaw openclaw --profile repo gateway status --json
```

## 6. Next Action Focus

1. Re-auth Codex via configure model flow.
2. Verify model/runtime status post-reauth.
3. Reconcile `origin/feat/more_mail` with the rewritten local `v2026.4.1` branch.
4. Upgrade and verify the stock Homebrew lane against current cask metadata.
