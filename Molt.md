# Moltbook Integration Notes

## 1. What Moltbook Is

Moltbook is an external social network for AI agents. OpenClaw does not ship a native Moltbook connector; interaction requires a custom skill or bridge (e.g., webhook/HTTP client).

## 2. Document Boundary

- Keep Moltbook-specific run patterns and risk controls in `Molt.md`.
- Keep core OpenClaw onboarding and architecture in `Claw.md`.
- Keep broader fork and ecosystem context in `../Claws/Claws.md`.

## 3. What’s Possible

- **Pull-only status/read**: Use a small HTTP client (or skill) to fetch timelines and deliver summaries into an OpenClaw session.
- **Post/reply**: Use the Moltbook API via a reviewed skill/bridge to create posts or replies from a specific OpenClaw session.
- **Notifications**: Poll Moltbook for mentions/DMs on a schedule and surface them as read-only alerts in OpenClaw.
- **Isolated workflows**: Run Moltbook interaction from a separate OS user or container and forward only sanitized text into OpenClaw via loopback hook.

## 4. Reputable/Lower-Risk Patterns

- **Local HTTP bridge on loopback** (preferred): A small, reviewed client that speaks Moltbook’s HTTP API and posts results to an OpenClaw hook. Keeps secrets local; clear boundary; easy to audit.
- **Pinned, cloned skill**: Clone a Moltbook skill repo locally, review code, pin versions, and disable auto-updates. Run on loopback/tailnet only.
- **Read-only mode**: Start with fetch/summarize only; avoid write operations until trust is established.
- **Minimal scopes**: Use per-account tokens with the least privileges needed (read-only if possible); separate tokens per environment.

## 5. Safety Posture

1. Keep the gateway on loopback or tailnet; never expose Control UI or hooks publicly.
2. Treat all Moltbook-related code as untrusted; review source before enabling.
3. Use strict skill/exec allowlists; disable/remove anything unaudited.
4. Isolate credentials (separate OS user or container); store tokens with 600 perms.
5. Prefer read-only flows first; add posting only after review and with audit logging.
6. Pin dependencies and versions; avoid auto-update from indexes.

## 6. Warnings and Known Risks

- Past reports of malicious skills on community indexes (crypto-themed, obfuscated shell commands, token exfiltration).
- Media coverage calling skill extensions a “security nightmare,” citing large numbers of malicious uploads.
- Moltbook backend incidents have exposed tokens/DMs; some skills poll on timers, increasing exposure if credentials leak.
- Supply chain risk: community indexes list skills but do not vet code; binaries are rare but not impossible.

## 7. Open Items

- If we choose to proceed: pull the current Moltbook skill repo, list files/install commands/permissions, and pin a reviewed version.
- Decide default policy: block Moltbook skills by default, or allow only a reviewed read-only bridge.

## 8. External Coverage

- Human-oriented Moltbook guide: https://moltbook-for-humans.com
