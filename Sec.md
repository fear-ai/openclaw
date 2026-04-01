# OpenClaw Security Posture and Transition Plan

## 1. Purpose

This document captures current security posture, dominant threat classes, accepted mitigation ranges, and transition plan decisions.

Document roles for this set are defined in `Claw.md` §5.

## 2. Current Security Posture (2026-03-10)

## 2.1. High-level posture

From `2026.2.23` through `2026.3.8`, OpenClaw continued sustained hardening in:

- gateway/browser/proxy auth,
- exec approvals and wrapper handling,
- workspace/sandbox boundary enforcement,
- channel authorization parity for non-message ingress,
- onboarding/auth-flow safety,
- config validation and fail-closed behavior,
- safer upgrade, backup, and rollback paths.

High-signal security-relevant additions in the current review window:

- `2026.3.2` tightened loopback-only plaintext WebSocket behavior, added OpenAI Codex OAuth TLS prerequisite checks, and extended fail-closed hardening around node fetches, skills workspace boundaries, and safe writes.
- `2026.3.7` continued remote-gateway and invalid-config hardening, added baseline HTTP security headers, and kept broader browser and websocket controls on a stricter footing.
- `2026.3.8` added backup and verification commands that reduce upgrade and rollback risk, plus further hardening for browser redirect handling, `system.run`, and skill-download write boundaries.

## 2.2. Operational reality

Risk remains configuration- and operation-driven. Core failure modes are:

- exposure or trust-boundary misconfiguration,
- over-broad tool access in messaging contexts,
- stale runtime/process state after upgrades/builds,
- auth/provider flow confusion under changing upstream policies.

## 3. Threat Landscape

## 3.1. Most common threats

1. Gateway exposure misconfiguration

- non-loopback or proxy misconfiguration with weak auth.

2. Prompt/content injection against tool-enabled agents

- untrusted content causes unintended tool execution.

3. Over-broad capabilities in comms lanes

- shell/filesystem/control-plane tools exposed where they should be denied.

4. Token/credential leakage and drift

- stale, expired, or leaked auth material causes takeover or failure loops.

5. Service/process drift

- multiple competing gateway services/processes produce ambiguous runtime state.

## 3.2. Most pernicious threats

1. Exec approval bypass patterns

- wrapper/env/argv edge cases around allowlist and approval matching.

2. Filesystem escape vectors

- symlink/hardlink/alias path tricks around workspace-only expectations.

3. Proxy identity confusion

- forwarded-header trust mistakes in trusted-proxy setups.

4. Compliance-policy mismatch on auth reuse

- using auth flows/tokens outside provider-approved boundaries.

5. Runtime artifact/process mismatch

- stale long-lived process imports old dist chunk names after rebuild.

## 4. Accepted Mitigation Range

## 4.1. Minimum baseline (must-have)

- `gateway.bind: loopback`
- explicit gateway auth enabled
- insecure control-ui flags off in steady state
- per-peer/per-channel session scope for shared contexts
- deny runtime/fs/control-plane tools outside trusted lane
- one active gateway service profile for daily operation

## 4.2. Target hardened baseline

- dedicated runtime user boundary
- sandbox enabled for non-main/all runtime lanes as appropriate
- strict exec allowlist + approval gating
- explicit trusted-proxy config only where required
- release-intake and security-audit gate per upgrade

## 4.3. Not accepted

- reachable no-auth gateway mode
- broad messaging ingress with host-equivalent tools enabled
- unreviewed provider/token reuse patterns contrary to provider policy
- concurrent unmanaged gateway services/processes as steady-state

## 5. Approved Hybrid Transition

1. Harden current install and policy boundaries.
2. Move runtime to dedicated user boundary.
3. Enable sandbox in phased rollout.
4. Shift to remote-first runtime host.
5. Enable AV/browser lane only after explicit controls are proven.

Promotion between phases requires:

- no critical `openclaw security audit --deep` findings,
- stable runtime/channel behavior,
- tested rollback path,
- recorded decision in docs.

## 6. Current Security-Operational Notes

- Current runtime is healthy on repo profile `19001`; default/global service is not listening.
- Advisory warning remains about node path under nvm in LaunchAgent command path (stability, not immediate exploit by itself).
- OpenAI Codex OAuth reauth command path currently depends on configure/onboard model flow; plugin-login path is not valid in this workspace state.
- User-agent/identity behavior differs by provider path and must be considered during provider-side enforcement investigations.
- Security-significant upstream release notes have been reviewed through `2026.3.8`; deeper lane-by-lane policy refinement remains tracked in `Plan.md`.

## 7. Practical Mitigations to Keep Enforced

1. Keep a single active gateway service profile (`repo`) unless explicitly testing multi-profile behavior.
2. Use stop/build/start sequence after rebuilds to avoid stale dist imports.
3. Reverify auth profile health after reauth and after version upgrades.
4. Keep `ops-main` and `comms-bot` capability surfaces distinct.
5. Re-run release status and security audit as an explicit pre-upgrade gate.

## 8. References

OpenClaw references:

- `https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md`
- `https://docs.openclaw.ai/help/faq`
- `https://docs.openclaw.ai/gateway/security`
- `https://docs.openclaw.ai/gateway/remote`
- `https://docs.openclaw.ai/gateway/sandboxing`
- `https://docs.openclaw.ai/gateway/trusted-proxy-auth`

External:

- Anthropic legal/compliance: `https://code.claude.com/docs/en/legal-and-compliance`
- Community header-capture discussion (informational): `https://github.com/musistudio/claude-code-router/issues/341`
