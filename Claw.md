# OpenClaw: Program Orientation and Direction

## 0. Operating Context and Document Ownership

This project currently runs across two parallel worktree directories with different purposes:

1. `/Users/walter/Work/Claw/openclaw`

- upstream OpenClaw source worktree
- current source branch: `feat/more_mail`
- used for incremental code and configuration changes
- repo-driven runtime/testing lane uses `pnpm openclaw`
- repo-specific profile location: `~/.openclaw_repo`
- in that profile, `openclaw.json` points `workspace` at `/Users/walter/.openclaw-repo/workspace`

2. `/Users/walter/Work/Claw/openclaw-docs`

- project documentation worktree
- current docs branch: `claw_emails`
- used for strategy, findings, security framing, plans, and project synthesis

In parallel, stock-release behavior and external connection testing are also performed against the Homebrew-installed `openclaw` command using the default profile location. That stock lane must be kept distinct from the repo-development lane above.

Document ownership is split deliberately:

- OpenClaw team files are upstream-owned reference and control materials.
- We consult them regularly, but we do not modify them in normal project work.
- Changes to upstream-owned files, including files such as `AGENTS.md`, `README.md`, and the standard OpenClaw docs tree, require a strong reason and explicit Developer approval.
- Our maintained project documents are the root project files in this docs worktree, especially `Claw.md`, `Code.md`, `Sec.md`, `Plan.md`, and related project-specific notes.

## 1. Purpose

`Claw.md` is the strategy and decision entry point for this workspace. It captures current understanding, accepted decisions, and near-term direction.

Implementation facts live in `Code.md`. Security posture and mitigations live in `Sec.md`. Execution tasks live in `Plan.md`.

## 2. Current Understanding (2026-04-04)

OpenClaw is now best treated as a policy-and-runtime control plane, not only a chat bridge.

Current practical state:

- local development remains fast and viable,
- runtime safety depends on strict policy and service hygiene,
- provider/auth landscape is dynamic and requires frequent verification.

The local source worktree is now on `2026.4.1`, which is also the current upstream stable release base for this project. The stock Homebrew cask metadata is currently `2026.3.28`, while the installed stock lane on this machine still points at `2026.3.7`. Release tracking therefore still must keep the stock and repo lanes distinct.

## 3. Program-Level Decisions

## 3.1. Decision: Keep hybrid operating model

We continue with:

1. local-first code edit/build/debug loop,
2. explicit controlled runtime launch lane,
3. progressive move to stronger runtime isolation.

Reason:

- preserves throughput while containing runtime risk.

## 3.2. Decision: Maintain lane partition by range of impact

1. `ops-main`:

- coding, docs, shell, model switching, web search, email.

2. `comms-bot`:

- Discord/Telegram operations with constrained tool surface.

3. `av-browser` (future):

- AV devices, browser automation, broader chat/service access, default disabled until gated.

## 3.3. Decision: Auth/provider path must be explicit

- For OpenAI Codex OAuth in this build, use configure/onboard model flows (not plugin-login command path).
- Treat Claude-related access as two separate paths:
  - `claude-cli` backend (headers controlled by Claude CLI itself),
  - Anthropic provider path (headers/tokens handled via OpenClaw + pi-ai).

This split matters for reliability, compliance, and troubleshooting.

## 3.4. Decision: Service hygiene is mandatory

- Keep one active gateway service for daily operation (`repo` profile on `19001`).
- Avoid concurrent default/global service unless intentionally needed.
- Use build-stop-start sequence after artifact rebuilds to avoid stale chunk/runtime mismatches.

## 3.5. Decision: Use Himalaya as a mailbox interaction boundary, not the primary fetch layer

`himalaya` is the current mailbox client boundary for OpenClaw-side email work. In this design it is not the preferred Gmail-to-Maildir fetch or mirror tool. Its role is mailbox interaction: list, read, reply, forward, move, flag, and send across configured accounts once the mailbox source already exists.

OpenClaw invocation model:

- skill entry point: `skills/himalaya/SKILL.md`
- prerequisite check: `himalaya --version`
- account setup: `himalaya account configure` or `himalaya account configure <account>`
- account selection in the installed `himalaya` build is per subcommand, using `-a <account>`
- mailbox listing and search:
  - `himalaya folder list -a <account>`
  - `himalaya envelope list -a <account>`
  - `himalaya envelope list -a <account> --folder "Sent"`
  - `himalaya envelope list -a <account> --output json`
- message access and disposition:
  - `himalaya message read -a <account> <id>`
  - `himalaya message export -a <account> <id> --full`
  - `himalaya message reply -a <account> <id>`
  - `himalaya message forward -a <account> <id>`
  - `himalaya message move -a <account> <id> "Archive"`
  - `himalaya flag add -a <account> <id> --flag seen`
  - `himalaya attachment download -a <account> <id>`
- composition and send:
  - `himalaya message write`
  - `himalaya template send`

State management boundary:

- primary config file: `~/.config/himalaya/config.toml`
- account state is explicit under `[accounts.<name>]`
- auth can be stored as:
  - command-based secret retrieval (`backend.auth.cmd`)
  - keyring-backed secret lookup
  - raw password for testing only
- message transport and mailbox state remain in provider stores or local mail stores selected by the backend:
  - IMAP
  - Maildir
  - Notmuch
- Himalaya also keeps its own synchronization state and cache under XDG-managed `pimalaya/email/sync` paths
- OpenClaw should treat that state as Himalaya-owned connector state, not as the canonical OpenClaw audit or policy store

Skill boundary:

- OpenClaw uses the Himalaya skill as a process/tool wrapper around the external CLI
- this gives immediate mailbox operations without requiring OpenClaw to embed Himalaya internals
- OpenClaw should normalize Himalaya output and errors at the boundary, but should not treat Himalaya as the system of record for policy, relevance, feedback, or branch-wide audit history
- fetch or mirror into Maildir should remain a separate concern handled by tools such as `neverest`, `getmail6`, `hoardy-mail`, `isync` / `mbsync`, `offlineimap3`, or `cloud_mdir_sync`

## 3.6. Decision: Keep OpenClaw as the control-plane base, and treat alternatives as layer references

OpenClaw should still be treated as the primary runtime and control-plane base for this project. The important correction is where OpenClaw is already strong versus where additional work is still needed.

OpenClaw strengths that should be preserved and extended rather than displaced:

- multi-channel operator surface and gateway model
- mature remote-operation posture compared with most alternatives
- native `MCP` support, including configured MCP servers, bundled MCP tooling, and `openclaw mcp serve`
- native `ACP` support, including explicit CLI/runtime support and conversation-bound ACP agents across multiple built-in channels
- practical dispatch model for long-running or remote agent work

This matters because some adjacent projects look more coherent in one narrow area while still being weaker than OpenClaw as a broad control plane. For this project, the missing layer is not more protocol plumbing. The missing layer is deeper communication-state handling on top of the existing OpenClaw base.

OpenClaw weak spots that remain directly relevant to this project:

- email remains shallower than the product aura suggests
- durable local message-store semantics are still weak compared with what Maildir-based and index-backed designs can support
- prioritization, blocking, and policy state over communications are not first-class
- structured workspace or business-domain state is still thinner than what some OpenClaw-line variants are attempting
- `A2A` is still not a serious first-class story in the same sense that `MCP` and `ACP` are

That framing sharpens how alternatives should be used.

`Hermes` is not mainly a reason to replace OpenClaw. It is a reference for a tighter personal-agent loop: stronger memory posture, direct IMAP/SMTP email support, explicit MCP management ergonomics, and a more coherent "persistent agent" narrative. It is useful as a reference for what a more unified personal-agent experience can feel like, but it is still a Python-first alternative with different integration boundaries. Product-level details belong in `Claws.md`.

`DenchClaw` is not mainly a reason to abandon OpenClaw either. It is the strongest current OpenClaw-line public fork and is useful because it pushes the platform toward CRM, workspace objects, DuckDB-backed structured state, reports, and document-oriented workflows. That is much closer to the sidecar and workspace direction relevant to this project. Product-level details belong in `Claws.md`.

`NanoClaw` and `NemoClaw` are best treated as security and containment critiques of the upstream OpenClaw operating model. They matter because they show what a smaller or more sandboxed OpenClaw-like deployment posture can look like, not because they solve the email and message-state problems driving this project.

`Paperclip` and `gstack` sit above the runtime rather than beside it. `Paperclip` is best understood as an orchestration and governance layer for many agents, while `gstack` is a methodology and review/process layer for agent-assisted development sessions. They are useful comparative references, but neither answers the core project question of how to deepen OpenClaw's communication substrate.

The resulting direction is straightforward:

- keep OpenClaw as the base runtime and control plane
- deepen the email and local-message-store layer around it
- treat `Hermes` as a reference for direct email and memory posture
- treat `DenchClaw` as a reference for structured workspace and sidecar patterns
- treat `NanoClaw` and `NemoClaw` as deployment and security references
- treat `Paperclip` and `gstack` as higher-layer workflow references

Detailed product-by-product comparison belongs in `Claws.md`. `Claw.md` should keep only the comparative conclusions that materially affect OpenClaw project direction.

## 3.7. Decision: Continue the next several iterations on OpenClaw, not on Hermes

This choice is now specific enough to state directly.

For the next several iterations, the implementation base should remain `OpenClaw`. `Hermes` should be studied aggressively, but as a comparison target and design reference rather than as the primary execution environment.

### 3.7.1. Why the choice is still OpenClaw

The core work ahead is now clear:

- fetch mail from real providers into a durable local substrate,
- replay and reprocess that history repeatedly,
- display it with better context than current upstream OpenClaw email surfaces provide,
- attach prioritization, blocking, and policy state,
- add a sidecar store once Maildir filename semantics are no longer enough.

That work exists regardless of whether the runtime is OpenClaw or Hermes.

Switching to `Hermes` would not remove the hard parts:

- Maildir ingestion still has to be designed and validated.
- reprocessing logic still has to be defined, whether through `notmuch` or a fresh custom index path;
- message-display semantics still have to be developed;
- sidecar schema still has to be designed once mailbox flags, folders, and filenames stop being expressive enough;
- multi-provider and multi-account policy still has to be made explicit.

So the decisive question is not "which project already does email better today?" The decisive question is "which project is the better base once custom Maildir, replay, policy, and sidecar work begin?" On that question, OpenClaw remains the stronger base.

### 3.7.2. What OpenClaw already gives this project

OpenClaw already provides the stronger control-plane and runtime substrate:

- broader multi-channel operator surface;
- stronger remote-operation posture;
- native `MCP` support;
- native `ACP` support;
- existing local code familiarity and active branch context;
- existing fit with the project's broader communication and workflow direction.

This matters because the email work is not intended to become a disconnected mailbox side project. It is intended to deepen OpenClaw itself as a communication substrate. Building the next iterations on OpenClaw keeps that work attached to the platform that already matters for the broader project.

### 3.7.3. What Hermes does better, and why that still does not change the base choice

Hermes is still the strongest non-fork comparison target.

Its strengths are real:

- built-in IMAP receive and SMTP send;
- tighter personal-agent framing;
- stronger memory posture;
- cleaner MCP operator ergonomics in some workflows;
- explicit optional Honcho-backed user modeling;
- a more coherent "persistent personal agent" story than upstream OpenClaw currently presents.

Those strengths should be studied, but they do not yet outweigh the cost of shifting the implementation base.

Hermes is still a Python-first alternative with a different runtime shape and different extension boundary. Adopting it as the main base now would create a platform shift before solving the actual hard problem, which is not "make IMAP work" but "design a durable local communications layer with replay, triage, policy, and sidecar state."

In other words:

- Hermes is ahead on direct email posture,
- but not obviously ahead on the Maildir-plus-sidecar architecture we actually need.

### 3.7.4. Why Maildir changes the decision

Maildir is the turning point in this comparison.

Once the project commits to:

- durable local mailbox mirroring,
- replay and reprocessing of historical messages,
- richer local display and search,
- policy state and classification outside provider APIs,

the problem becomes a storage and workflow problem, not merely a provider-connector problem.

At that point, the strongest needs are:

- a stable control-plane base,
- clear boundaries between fetch, store, display, and policy,
- disciplined sidecar design,
- the ability to expose the resulting functionality back through OpenClaw channels, tools, and agents.

OpenClaw already matches those needs better than Hermes because the project is trying to deepen OpenClaw's communication capabilities, not stand up a separate personal-mail agent product beside it.

### 3.7.5. What remains undecided inside the OpenClaw path

Keeping OpenClaw as the base does not settle several important design questions:

- whether reprocessing should begin through `notmuch` or through a fresh custom index/query layer;
- what the first sidecar schema should be;
- how much Gmail-specific metadata should be preserved versus normalized;
- how strongly to couple Maildir display to Himalaya versus implementing a more direct OpenClaw adapter;
- when Maildir filenames and folder semantics stop being expressive enough and structured state must take over.

Those are now the right questions to spend effort on.

### 3.7.6. How the alternatives should be used

The alternatives remain useful, but in narrower roles:

- `Hermes`: reference for direct email posture, memory layering, and user-modeling choices, especially the Honcho decision;
- `DenchClaw`: reference for structured workspace state, CRM/document flows, and DuckDB-backed sidecar patterns;
- `NanoClaw` and `NemoClaw`: reference for security, containment, and operational hardening;
- `Paperclip`: reference for orchestration/governance above the runtime;
- `gstack`: reference for development process, review discipline, and agent-session governance.

The practical result is that the comparison work should now serve implementation rather than indecision.

### 3.7.7. Immediate consequence for the project

The project should now behave as if the runtime choice is provisionally settled:

- continue implementation on `OpenClaw`;
- treat `Hermes` as an active review target, not a migration target;
- review `NemoClaw` next for security and deployment ideas worth applying;
- review `DenchClaw` next for sidecar and workspace patterns worth lifting;
- follow up with the Hermes and Dench communities on the specific questions created by the current analysis.

If later evidence shows that OpenClaw cannot support the Maildir-plus-sidecar direction cleanly enough, the comparison can be reopened. At current evidence, reopening it now would delay the real work without changing the technical obligations ahead.

## 4. Ongoing and Future Aspirations

## 4.1. Near-term

- Complete reliable Codex OAuth reconnect through the current supported command path.
- Keep model switching healthy between default and fallback providers.
- Continue upstream intake and patch adoption with explicit risk review.

## 4.2. Mid-term

- Complete dedicated runtime user boundary and sandbox-first runtime posture.
- Move runtime to remote host with controlled local operator/node interaction.
- Keep local dev lane for active OpenClaw code work.

## 4.3. Long-term

- Enable AV/browser lane under explicit policy and transport controls.
- Expand integrations without weakening trust boundaries.
- Maintain evidence-backed decision logs in this docs branch.

## 5. Document Map Preamble and Boundaries Between Documents

Single-source documentation: the full documentation body should optimize for clarity, accessibility, progressive exposure, and rapid learning; it should carry high information density without unnecessary repetition.

Rules:

1. Each major subject gets one canonical section or subsection that groups the relevant material.
2. The documentation may expose the reader to the same subject at increasing levels of complexity and technical knowledge, but redundancy is not accepted.
3. Earlier in the same file may contain one tight forward reference to the canonical section for a subject.
4. Other files may include only a narrow context-specific mention, or an explicit reference to the relevant named and numbered section/subsection.
5. `Claw.md` owns the document map for this project documentation set.
6. Other project files must not duplicate the document map or repeat parallel lists of the same structure.
7. When a specific industry or scientific term first appears, add a short explanation.
8. For idiomatic or multi-term expressions, introduce the full phrase first and add an abbreviation in parentheses for later use, for example `User Experience (UX)`.

- `Claw.md`: strategy, decisions, trajectory.
- `Code.md`: verified implementation facts, release deltas, runtime observations, and commands justified by evidence.
- `Sec.md`: threat posture, mitigations, accepted security range, and security-gated transition criteria.
- `Plan.md`: branch-wide active work, sequencing, gates, and next actions.
- `Email.md`: canonical email-domain document for architecture, validation status, options, terminology, and substantive Email-project planning when keeping it there improves usability. It does not own the branch-wide execution order or promotion gates.

## 6. References

OpenClaw + related references:

- `https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md`
- `https://docs.openclaw.ai/help/faq`
- `https://docs.openclaw.ai/gateway/security`
- `https://docs.openclaw.ai/gateway/remote`
- `https://docs.openclaw.ai/gateway/sandboxing`
- `https://docs.openclaw.ai/gateway/trusted-proxy-auth`

External policy reference:

- `https://code.claude.com/docs/en/legal-and-compliance`

## 7. Immediate Direction

Execution details and next actions are tracked in `Plan.md`; security acceptance criteria remain in `Sec.md`.
