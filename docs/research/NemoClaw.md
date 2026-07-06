# NemoClaw

## 1. Agent Bring-Up, Browser Access, and Upgrade

### 1.1 Working Assumptions for an LLM Agent

Assume this operating model unless the operator says otherwise:

- the official Docker GUI is already running
- Docker itself is the source of truth for runtime health
- NemoClaw is managed from the host, not from inside an arbitrary helper container
- OpenClaw runs inside the sandbox
- `nemoclaw onboard` is the canonical create-or-recreate command
- `openshell term` is the host-side supervision surface
- `openclaw tui` is the in-sandbox terminal UI
- the dashboard is expected on `http://127.0.0.1:18789/`
- the operator intends to use `gog` and `himalaya`
- four Gmail accounts are already authorized outside NemoClaw itself
- Discord bot setup is planned
- Telegram setup is still to be determined
- local Ollama is desired
- OpenAI, Anthropic, and lower-cost Gemini paths are desired

If the runtime is already up, do not start by reinstalling Docker. Start by verifying what exists.

### 1.2 First Commands to Run

Host-side verification:

```bash
docker version
docker info
docker ps
nemoclaw --version
openshell status
nemoclaw list
```

If there is already a registered sandbox:

```bash
nemoclaw <name> status
openshell inference get
nemoclaw <name> connect
```

Inside the sandbox:

```bash
openclaw --version
openclaw tui
```

If no sandbox exists yet, or if it must be rebuilt:

```bash
nemoclaw onboard
```

### 1.3 Browser Access

Check the dashboard first:

```bash
curl -sf http://127.0.0.1:18789/ >/dev/null && echo dashboard-up
```

Open the browser locally:

```bash
open http://127.0.0.1:18789/
```

If the browser will connect through a different origin, set that origin before rebuild:

```bash
export CHAT_UI_URL="https://your-dashboard-origin.example"
nemoclaw onboard --resume --recreate-sandbox
```

### 1.4 Upgrade to Latest Stable

As verified from the public GitHub tags page on April 10, 2026, the newest visible stable tag is `v0.0.11`, and the GitHub Releases page shows no packaged releases.

Hosted-installer upgrade path:

```bash
curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash
```

Source-checkout upgrade path to the latest currently verified stable tag:

```bash
git fetch --tags
git checkout v0.0.11
npm install
cd nemoclaw && npm install && npm run build && cd ..
cd nemoclaw-blueprint && uv sync && cd ..
npm link
nemoclaw --version
```

If a newer stable tag exists later, use that newer tag instead of `v0.0.11`.

### 1.5 Relaunch and Recovery

If the host restarted and Docker is still healthy:

```bash
openshell gateway start --name nemoclaw
nemoclaw <name> connect
```

If provider-family or build-time values changed:

```bash
nemoclaw onboard --resume --recreate-sandbox
```

If the gateway exists but the sandbox is missing or unhealthy:

```bash
openshell sandbox list
nemoclaw <name> status
nemoclaw onboard
```

### 1.6 Provider Plan for This Installation

Treat provider intent in this order:

1. local Ollama for low-cost and offline iteration
2. OpenAI for ChatGPT-family models through the OpenAI API path
3. Anthropic for Claude-family models through the Anthropic API path
4. Gemini Flash or Flash Lite for low-cost cloud fallback

Important correction for an agent: ChatGPT Pro and Claude Code are end-user products, not NemoClaw inference backends by themselves. In NemoClaw, those paths map to OpenAI API credentials and Anthropic API credentials, not consumer web subscriptions.

Same-family runtime switches:

```bash
openshell inference set --provider ollama-local --model llama3.2:1b
openshell inference set --provider openai-api --model gpt-5.4
openshell inference set --provider anthropic-prod --model claude-sonnet-4-6
openshell inference set --provider gemini-api --model gemini-2.5-flash
```

Cross-family switch plus recreate:

```bash
openshell inference set --provider anthropic-prod --model claude-sonnet-4-6 --no-verify
export NEMOCLAW_MODEL_OVERRIDE="anthropic/claude-sonnet-4-6"
export NEMOCLAW_INFERENCE_API_OVERRIDE="anthropic-messages"
nemoclaw onboard --resume --recreate-sandbox
```

### 1.7 `gog`, `himalaya`, Discord, and Telegram

`gog` and `himalaya` are adjacent host-side tools, not NemoClaw subcommands. Assume they are part of the operator workflow around OpenClaw.

Useful `gog` commands once OAuth is already in place:

```bash
gog auth list
gog gmail search 'newer_than:7d' --max 10
gog gmail messages search "in:inbox" --max 20 --account you@example.com
gog calendar events primary --from 2026-04-10T00:00:00Z --to 2026-04-11T00:00:00Z
```

Useful `himalaya` commands:

```bash
himalaya account list
himalaya envelope list
himalaya message read 42
himalaya message reply 42
```

Discord is a supported NemoClaw onboarding path once the bot token, server ID, and reply mode are known. Telegram is supported in the stack, but in this planned deployment it should be treated as pending until the desired token and allowlist posture are decided.

### 1.8 Status, Logs, Load, and Shutdown

Fast status:

```bash
nemoclaw list
nemoclaw <name> status
openshell inference get
docker ps
docker stats
```

Logs:

```bash
nemoclaw <name> logs --follow
openshell term
```

Inside the sandbox:

```bash
ps aux
top
df -h
```

Orderly shutdown:

```bash
nemoclaw stop
```

Destructive teardown:

```bash
nemoclaw <name> destroy --yes
```

### 1.9 Ask for Help

If bring-up or recovery fails, gather the smallest useful evidence first:

```bash
docker version
openshell status
nemoclaw <name> status
nemoclaw <name> logs --follow
nemoclaw debug --quick
```

Then use:

- NemoClaw Discord: `https://discord.gg/XFpfPv9Uvx`
- GitHub Issues: `https://github.com/NVIDIA/NemoClaw/issues`

## 2. Project Intent

### 2.1 What NemoClaw Is Trying to Do

NemoClaw is an opinionated reference stack for running OpenClaw as an always-on assistant inside an OpenShell-managed sandbox. Its goal is not to replace OpenClaw or OpenShell. Its goal is to make a particular deployment pattern repeatable:

- OpenClaw provides the assistant runtime, workspace, tools, TUI, and agent behavior.
- OpenShell provides the host-side gateway, credential proxying, sandbox lifecycle, inference routing, and policy enforcement.
- NemoClaw adds the opinionated layer that turns those general capabilities into a guided, reproducible OpenClaw deployment.

Technically, that means NemoClaw tries to solve four problems at once:

1. Turn a general sandbox runtime into a one-command OpenClaw deployment flow.
2. Keep provider credentials on the host while letting the sandbox speak only to `inference.local`.
3. Apply a hardened baseline for network, filesystem, process, and dashboard behavior from the first boot.
4. Give operators a stable host-side lifecycle command, `nemoclaw onboard`, rather than making them hand-assemble OpenShell resources.

### 2.2 What It Is Not

NemoClaw is not the generic runtime substrate. OpenShell owns that. It is not the assistant itself. OpenClaw owns that. It is also not primarily a container image project. The image matters, but the real product is the host-side orchestration path that selects providers, validates credentials, creates or recreates the gateway, builds the sandbox image, applies policy, and then hands the operator a working assistant.

### 2.3 Technical Trajectory

The project direction is visible in its docs, source tree, and recent issue and PR history:

- toward stronger host-side recovery after restarts and gateway drift
- toward tighter secret handling and fewer image-baked credentials
- toward broader inference support, especially OpenAI-compatible, Anthropic-compatible, Gemini, and local inference paths
- toward better day-2 operations for macOS, Linux, and WSL2 rather than just first-run onboarding
- toward keeping OpenClaw inside the sandbox and keeping OpenShell as the enforcement layer, instead of collapsing those boundaries

The current trajectory is still alpha. The repo and docs show clear momentum, but the issue history also shows active work in runtime recovery, WSL behavior, local inference validation, channel messaging, and secret hardening.

## 3. Runtime Boundaries

### 3.1 Host, OpenShell, and Sandbox

The most important technical boundary is this:

- `nemoclaw` runs on the host
- OpenShell runs on the host and owns the gateway and enforcement plane
- OpenClaw runs inside the sandbox

This explains why Docker must be running on the host, why provider credentials stay on the host, and why the right lifecycle command is host-side.

### 3.2 Why a Utility Container Is Usually the Wrong Place to Run NemoClaw

Running NemoClaw from inside an arbitrary helper container inverts the intended model. It turns a host orchestrator into a guest process that now needs Docker socket passthrough, host networking assumptions, and more brittle recovery paths. The published quickstart, README, and source all align on a host-first model, not a Docker-outside-of-Docker default.

### 3.3 OpenClaw Responsibilities

OpenClaw remains the assistant runtime:

- workspace files and memory
- tools and skills
- channel behavior as exposed to the assistant
- TUI and agent prompt execution

NemoClaw does not replace those behaviors. It packages them into a managed OpenShell deployment.

## 4. Platform Reality

### 4.1 macOS

macOS is tested with limitations. The repo docs consistently point to Docker Desktop or Colima, and they explicitly note that `brew install docker` alone is not enough because that gives you the CLI, not the daemon.

Key macOS facts:

- install Xcode Command Line Tools before first use
- start Colima or Docker Desktop before onboarding
- expect Docker socket path differences across Colima versions
- watch port `18789` for dashboard conflicts

Typical macOS start sequence:

```bash
xcode-select --install
colima start
docker version
nemoclaw onboard
```

### 4.2 Linux

Linux with Docker Engine is the primary tested path. It is the lowest-friction environment for NemoClaw.

Key Linux facts:

- Docker daemon health and user group membership matter
- swap matters on lower-memory systems because image build and push paths are memory heavy
- local Ollama must be reachable from the sandbox, not just from the host shell

Typical Linux start sequence:

```bash
sudo systemctl start docker
docker version
nemoclaw onboard
```

### 4.3 WSL2 and Other Runtime Choices

WSL2 is supported with limitations and is clearly a higher-risk path in the repo history. The recent issue list shows onboarding handoff problems and local inference reachability mismatches there. Podman is not the tested default and the docs repeatedly steer operators back to Docker Desktop, Colima, or Docker Engine.

## 5. Architecture

### 5.1 CLI, Plugin, and Blueprint

NemoClaw is split between:

- the host CLI in `src/` and `bin/`
- the OpenClaw plugin package in `nemoclaw/`
- the versioned blueprint and policy YAML in `nemoclaw-blueprint/`

That structure matters because the project is deliberately split between a thin operator CLI, a plugin that integrates with OpenClaw, and a blueprint that drives OpenShell resource creation and policy application.

### 5.2 Inference Routing

Inference requests do not leave the sandbox directly. The agent talks to `inference.local`. OpenShell intercepts the request and forwards it to:

- NVIDIA Endpoints
- OpenAI
- Anthropic
- Google Gemini
- compatible OpenAI or Anthropic endpoints
- local Ollama
- experimental local NIM or vLLM paths

This is the core design choice that keeps provider credentials on the host and makes provider switching possible without rewriting agent code.

### 5.3 Policy and Protection Layers

The docs describe four main protection planes:

- network egress policy
- filesystem controls
- process privilege reduction
- inference routing control

The repo and docs also make a practical distinction:

- some policy changes can be applied dynamically to a running sandbox
- other properties are locked at sandbox creation or image build time

### 5.4 State and Persistence

Host-side state lives under `~/.nemoclaw`, while OpenClaw workspace and assistant state live inside the sandbox. That split is intentional. It lets NemoClaw manage credentials and orchestration metadata on the host while OpenClaw owns assistant memory and workspace files inside the container.

## 6. Security and Operational Cautions

### 6.1 Credentials

The intended model is:

- provider credentials stay on the host
- OpenShell injects or proxies them
- the sandbox should not become a general credential store

That intent is strong, but the docs and issue history show that the project has still been working through concrete edge cases, especially around Brave Search, build args, and redaction consistency.

### 6.2 Dashboard and Device Authentication

The dashboard listens on `18789` and validates browser origin. Remote use requires the correct `CHAT_UI_URL` at build time. Device authentication and origin handling are security-relevant, especially once the dashboard is reachable beyond localhost.

### 6.3 Filesystem and Network Reality

The docs present Landlock, seccomp, capability drops, and network namespace isolation as major parts of the sandbox posture. The issue history shows why operators should treat those as implementation details that must be verified, not just marketing claims. In other words: the design is clearly security-first, but the repo is still young enough that operators should validate behavior instead of assuming every layer is perfect.

## 7. Issue and PR History

For compactness, issue dates below are opened dates and PR dates are merged dates.

- `2026-03-17` - PR `#177`: checksum verification for external binary downloads
- `2026-03-26` - Issue `#995`: unclear macOS/Ollama error when local inference is down
- `2026-04-07` - Issue `#1572`: WSL installer handoff fails with "Argument list too long"
- `2026-04-08` - Issue `#1605`: onboarding gateway startup failure on Ubuntu
- `2026-04-08` - PR `#1632`: block secret writes into persistent workspace memory
- `2026-04-08` - PR `#1645`: configurable port overrides via environment variables
- `2026-04-09` - Issue `#1692`: Telegram regression from deprecated TLS and group-policy migration
- `2026-04-09` - PR `#1700`: restrict baseline `npm_registry` access to the `openclaw` binary path
- `2026-04-10` - Issue `#1736`: secret redaction drift across modules
- `2026-04-10` - Issue `#1739`: Landlock filesystem policy not enforced on OpenShell `0.0.26`
- `2026-04-10` - Issue `#1741`: Brave API key exposure through Docker build args and baked config
- `2026-04-10` - Issue `#1750`: WSL2 Ollama discovered, but `inference.local` returns 404 at runtime
- `2026-04-10` - Issue `#1752`: Gemini Flash 3 preview run instability and `400` errors
- `2026-04-10` - PR `#1754`: mitigate Brave API key exposure in Docker builds
- `2026-04-10` - PR `#1755`: fix proxy-only sandbox media downloads for Telegram, Discord, and Slack
- `2026-04-10` - PR `#1756`: surface local inference health in `nemoclaw <name> status`
- `2026-04-10` - PR `#1757`: add `SLACK_ALLOWED_CHANNELS` onboarding support
- `2026-04-10` - Issue `#1758`: community Claude Code skill for NemoClaw host management

The history says three things clearly:

1. the project is actively hardening itself
2. macOS, WSL2, and local inference are still active rough edges
3. the security model is real, but so are the implementation gaps found during rapid iteration

## 8. Direction and Current Condition

### 8.1 Release Shape

The tag line is short and recent: `v0.0.1` through `v0.0.11`, with `latest` currently pointing at the same commit as `v0.0.11` in this local checkout.

### 8.2 Project Direction

The repo direction appears to be:

- keep `nemoclaw onboard` as the canonical lifecycle command
- push more validation and recovery into the operator workflow
- broaden provider coverage without weakening the `inference.local` boundary
- tighten secret handling and build-time safety
- improve remote and messaging integrations without abandoning the sandbox-first model

### 8.3 Current Condition

NemoClaw is best understood as a serious alpha reference stack:

- technically coherent
- security-motivated
- clearly useful for OpenClaw deployments
- not yet boring enough to treat as invisible infrastructure

## Appendix A. Sample `AGENTS.md`

This sample works as a repo-local instruction file for agentic tools such as Claude Code, Codex, and Cursor.

```md
# AGENTS.md

## Scope

This repository uses NemoClaw as a host-managed lifecycle wrapper around OpenClaw and OpenShell.

Work from the host model:

- `nemoclaw` runs on the host
- OpenShell owns gateway, policy, and sandbox lifecycle
- OpenClaw runs inside the sandbox

Do not recommend running NemoClaw from inside an arbitrary long-lived helper container unless the user explicitly wants a Docker-socket-based setup and understands the tradeoffs.

## High-Value Commands

- `nemoclaw onboard`
- `nemoclaw list`
- `nemoclaw <name> status`
- `nemoclaw <name> connect`
- `nemoclaw <name> logs --follow`
- `openshell term`
- `docker version`
- `openshell inference get`

## Runtime Assumptions

- macOS should use Docker Desktop or Colima
- `brew install docker` alone is not enough on macOS
- Linux should use Docker Engine unless the task explicitly concerns another runtime
- WSL2 support exists but is not the least-risk path

## Debugging Guidance

When install or onboard fails, check these in order:

1. `docker version`
2. runtime-specific health (`colima status` or Docker Desktop)
3. `openshell status`
4. `nemoclaw <name> status` or `nemoclaw onboard`
5. `openshell term` for policy or network visibility

## Security Notes

- Never print or persist provider secrets casually
- Be cautious with Docker build args and image-baked config
- Assume sandbox config mutability is intentionally constrained
```

## Appendix B. Sample `SKILL.md`

This sample is for a reusable operator skill that can be used by agent harness systems.

```md
# NemoClaw Operator Skill

## When to Use

Use this skill when:

- diagnosing NemoClaw install or onboarding problems
- working with Docker, Colima, or OpenShell for NemoClaw
- explaining host versus sandbox responsibilities
- reviewing policy, inference, or credential handling

## Core Rules

1. Treat `nemoclaw onboard` as the canonical lifecycle operation.
2. Treat Docker runtime health as a prerequisite, not an implementation detail.
3. Distinguish host paths from sandbox paths.
4. Prefer official docs and current issue history over stale assumptions.
5. Do not suggest editing sandbox internals as the first-line solution.

## Workflow

### 1. Establish runtime context

- OS: macOS, Linux, or WSL2
- container runtime: Docker Desktop, Colima, Docker Engine, other
- NemoClaw install mode: hosted installer or source checkout
- current command and error text

### 2. Verify runtime

Run or ask for:

- `docker version`
- `docker info`
- `docker context ls`
- `colima status` on macOS if relevant
- `openshell status`

### 3. Verify NemoClaw surface

Run or ask for:

- `nemoclaw --version`
- `nemoclaw list`
- `nemoclaw <name> status`

### 4. Use the correct debug plane

- onboarding or rebuild issue: `nemoclaw onboard`
- blocked network or policy issue: `openshell term`
- sandbox runtime issue: `nemoclaw <name> logs --follow`
- local inference issue: verify the host model server separately

## Anti-Patterns

- do not default to Docker-in-Docker guidance
- do not assume host `localhost` equals sandbox `localhost`
- do not assume secrets should be baked into images or Docker args
- do not bypass NemoClaw with raw OpenShell lifecycle commands unless explicitly intended
```

## Appendix C. Repository Layout and Current Snapshot

### C.1 Repository Layout

```text
NemoClaw/
├── bin/                    CLI entrypoints
├── src/                    host-side CLI and lifecycle logic
├── nemoclaw/               OpenClaw plugin package
├── nemoclaw-blueprint/     versioned blueprint and policy YAML
├── scripts/                install and utility scripts
├── test/                   integration and end-to-end tests
└── docs/                   published product and operator docs
```

### C.2 Local Review Snapshot

- local commit reviewed: `e53167c`
- tags on that commit: `v0.0.11`, `latest`
- project status signal from README: alpha

### C.3 Contributor Snapshot

Top contributors in this local checkout by `git shortlog`:

- Carlos Villela
- Aaron Erickson
- Miyoung Choi
- KJ
- Brandon Pelfrey

## Appendix D. Sources Reviewed

Primary local sources:

- `README.md`
- `CONTRIBUTING.md`
- `docs/about/overview.md`
- `docs/about/how-it-works.md`
- `docs/reference/commands.md`
- `docs/reference/architecture.md`
- `docs/reference/troubleshooting.md`
- `docs/inference/inference-options.md`
- `docs/inference/switch-inference-providers.md`
- `docs/inference/use-local-inference.md`
- `docs/deployment/deploy-to-remote-gpu.md`
- `src/nemoclaw.ts`

Adjacent OpenClaw ecosystem sources used for `gog` and `himalaya` examples:

- `../openclaw/skills/gog/SKILL.md`
- `../openclaw/skills/himalaya/SKILL.md`

External sources:

- NVIDIA NemoClaw quickstart: `https://docs.nvidia.com/nemoclaw/latest/get-started/quickstart.html`
- NVIDIA NemoClaw docs index: `https://docs.nvidia.com/nemoclaw/latest/`
- NemoClaw GitHub tags: `https://github.com/NVIDIA/NemoClaw/tags`
- NemoClaw GitHub releases: `https://github.com/NVIDIA/NemoClaw/releases`
- NemoClaw issue and PR history, including `#995`, `#1572`, `#1605`, `#1692`, `#1736`, `#1739`, `#1741`, `#1750`, `#1752`, `#1754`, `#1755`, `#1756`, `#1757`, `#1758`
