# OpenClaw Email Processing

## 1. Introduction

Email remains one of the highest-value but highest-friction information streams for operators, builders, and small teams running OpenClaw. The core difficulty is not raw ingestion. The difficulty is selective attention under constant change: too many updates, uneven source quality, conflicting urgency signals, and unclear trust boundaries for automation.

This document treats email handling as an accessibility and decision-quality problem first, and an integration problem second. The objective is to define a practical path from noisy inbound streams to reliable, explainable, policy-bounded actions.

## 2. Methodology

The research and design process in this document follows a user-centric, evidence-weighted approach focused on operational outcomes rather than tool novelty.

### 2.1. Research posture and attitude

The guiding stance is pragmatic and skeptical:

- prioritize persistent user pain over feature checklists,
- distinguish interesting demos from repeatable operations,
- treat security claims and AI claims as hypotheses until verified in concrete flows,
- prefer reversible decisions and explicit gates over optimistic automation.

### 2.2. Evidence and decision rules

Evidence is weighted in descending order of reliability: inspected code and manifests, executable workflows, and only then marketing or repository narratives. A candidate is never treated as production-ready based on naming, stars, or package existence alone.

Decision quality is improved by separating:

- capability evidence (what can be done),
- operational evidence (what runs reliably),
- governance evidence (what can be explained, audited, and constrained).

### 2.3. Scope boundaries for this phase

In scope:

- Gmail native path: OpenClaw webhook pipeline with `gog` + Gmail Pub/Sub.
- IMAP/SMTP path for provider coverage and fallback.
- Multi-account isolation policy and validation criteria.
- OSS and commercial pattern analysis for reusable workflow semantics.
- AR-aligned triage principles: progressive exposure, dedupe, explanation fields, and exposure-bias controls.

Out of scope for now:

- autonomous send/forward without approval gates,
- polished cross-vendor benchmark publication,
- enterprise compliance programs beyond operator-grade hardening.

Methodology conclusion:
the goal is not maximal automation. The goal is trusted assistance that can be defended technically and accepted operationally.

## 3. Problem Statement

OpenClaw email operations are constrained by four recurring pain points.

First, update overload causes attention collapse: important items are hidden among repeated, low-value, or weakly contextualized messages.  
Second, source fragmentation creates workflow drift: Gmail-native, IMAP-based, and third-party workflows each optimize different layers and produce inconsistent behavior.  
Third, advisory and update signals are uneven in relevance: many alerts are technically true but operationally irrelevant to the current environment.  
Fourth, action confidence is brittle: users need to know why an item was surfaced and why an action was proposed before trusting higher automation levels.

Affected populations include:

- solo operators maintaining multiple inboxes and repos,
- small teams sharing operational responsibility without enterprise tooling,
- technical users who want AI support but reject opaque behavior.

Problem conclusion:
without explicit relevance modeling, trustable explanation, and controlled action gating, email automation increases cognitive load instead of reducing it.

## 4. Goals and Success Criteria

The project goals are to reduce cognitive overhead, preserve user control, and increase action quality under realistic inbox pressure.

Primary goals:

- reliably surface what matters now across heterogeneous sources,
- preserve account isolation and action safety,
- provide concise rationale for every non-trivial action,
- support progressive automation from observation to approved action.

Success is measured by decision outcomes, not activity volume:

- lower missed-important-message rate,
- acceptable false-priority and false-action rates,
- consistent explanation completeness,
- stable operations across at least two heterogeneous mailbox paths.

Goals conclusion:
the target is measurable trust: users should see fewer misses, fewer bad escalations, and clearer reasons for every surfaced action.

## 5. Solution Thesis, Benefits, and PMF

Solution thesis:
build an Adaptive Relevance email layer for OpenClaw that combines deterministic filtering, policy-aware AI triage, and explicit action gates. This is designed to produce trustworthy prioritization before autonomous execution.

Benefits by stakeholder:

- operators get lower noise and clearer action queues,
- teams get shared semantics for ownership, urgency, and follow-up,
- maintainers get a testable policy surface rather than ad hoc prompt behavior.

PMF assertion:
the need is persistent and cross-segment, because users consistently value relevant prioritization and safe execution more than breadth of integrations. The strongest adoption signal is not “more connectors,” but “fewer missed critical items with clear reasons and bounded risk.”

## 6. Requirements and Design Constraints

Functional requirements:

- support Gmail-native and IMAP-compatible ingestion paths,
- normalize provider-specific data into a common action schema,
- enforce account isolation and outbound policy gates,
- capture structured feedback and free-text rationale for model improvement.

Non-functional requirements:

- deterministic behavior in `L0-L2` paths,
- explicit observability for decisions and errors,
- reversible rollout with clear promotion criteria,
- manageable operational complexity for single-operator deployments.

Requirements conclusion:
if a design cannot be audited, rolled back, and operated by a small team without heroics, it does not meet the bar for this project.

## 7. Architecture and Design Direction

Architecture should separate concerns cleanly:

1. ingestion adapters (`gog`/PubSub, IMAP, optional sidecars),
2. normalization and dedupe,
3. deterministic policy filters,
4. AI triage for residual ambiguity,
5. action gates (`L0-L4`) with explanation logging,
6. feedback capture and replay evaluation.

This direction supports iterative build-vs-buy decisions: connector and interface layers can change without rewriting the relevance, policy, and audit core.

### 7.1. Decision-oriented findings

The central finding is that the hardest part of email automation is not connector setup. The hardest part is trustworthy prioritization under uncertainty.

- Relevance quality, explanation quality, and action safety are tightly coupled.
- Systems that optimize only ingestion speed or feature breadth tend to increase cognitive burden.
- Deterministic policy layers outperform model-only triage for baseline reliability.
- Users accept automation when they can see why an item surfaced and how to override the decision.
- Multi-provider support is valuable, but only after normalization and gating are stable.

### 7.2. Recommendations

Recommendation 1: Treat AR as the product core, not a UI add-on.
Build and evaluate progressive exposure, dedupe, trust signals, and explanation fields before scaling automated actions.

Recommendation 2: Sequence decisions by risk, not by technical excitement.
Stabilize `L0-L1` first, promote only when measured miss/false-action thresholds are met, and keep rollback explicit.

Recommendation 3: Use hybrid ingestion as the target architecture, but not as the first milestone.
Start with the highest-confidence Gmail path, then add IMAP/fallback once shared policy and audit layers are proven.

Recommendation 4: Keep evidence and decisions distinct.
Use raw tables as support material, but make adoption decisions from explicit findings, tradeoffs, and confidence levels.

### 7.3. Reading path for decision-makers

If the objective is decision-making rather than implementation detail, read this document in this order:

1. sections 3-7 for problem framing and strategic direction,
2. section 14 for current market/integration readiness signals,
3. section 13 for execution and promotion gates,
4. sections 11-12 and 17 only for technical due diligence.

## 8. Validation Status

This section captures current execution confidence, distinguishing verified behavior from inferred readiness. It is intentionally conservative: unresolved integration work is explicitly separated from observed facts.

### 8.1. Verified

- OpenClaw email docs are available and internally consistent for setup flow:
  - `docs/automation/gmail-pubsub.md`
  - `docs/automation/webhook.md`
  - `docs/hooks.md`
- `gog auth add` failure mode was reproduced:
  - `Error 403: org_internal`
  - root cause: OAuth client/consent audience policy mismatch.

### 8.2. Partially validated

- Google Cloud + Gmail OAuth command path and failure diagnostics are clear.
- First successful Gmail account authorization and first mailbox operation are still pending in this workspace.
- Himalaya IMAP path architecture is reviewed, but full read/send roundtrip remains pending.
- Role decision remains open:
  - `gog` as primary with IMAP fallback,
  - or IMAP as co-primary path.

### 8.3. Not yet validated end-to-end

- 2+ active mailboxes with strict account isolation.
- Stable hybrid operation (Gmail push + IMAP polling).
- Safe progression from label-only to draft/send at realistic load.

Validation conclusion:
the architecture direction is viable, but promotion beyond low-risk automation remains contingent on multi-account run evidence and end-to-end fallback testing.

## 9. Implementation Options

These options are not presented as equal choices. They define an evolution path from narrow reliability to broader coverage while preserving explainability and rollback safety.

### 9.1. Option A: Gmail native pipeline

Pipeline:

1. Gmail watch events.
2. Pub/Sub push.
3. `gog gmail watch serve`.
4. OpenClaw webhook route.
5. Agent execution and policy-gated actions.

Best when:

- Gmail is primary,
- low-latency event handling matters,
- OAuth setup can be controlled.

Main risks:

- OAuth consent/client policy breakage,
- strict project/topic alignment,
- more moving parts than IMAP polling.

### 9.2. Option B: IMAP-first pipeline

Pipeline:

1. IMAP poll/idle.
2. normalize message content.
3. deterministic rules.
4. AI triage on residual ambiguity.
5. action gate.

Best when:

- multiple providers are required now,
- Gmail OAuth path remains blocked.

Main risks:

- app-password posture is weaker than OAuth,
- polling and connection management overhead.

### 9.3. Option C: Hybrid

Pipeline:

- Gmail accounts on Pub/Sub + `gog`.
- non-Gmail or blocked Gmail accounts on IMAP (optionally via OAuth proxy).
- shared normalization and policy layer above both ingestion paths.

Best when:

- Gmail is high-volume but provider diversity is required.

Main risk:

- operational complexity from two ingestion stacks.

### 9.4. Controlled automation rollout

Define explicit action levels:

1. `L0 Observe`: ingest and score only.
2. `L1 Label`: apply labels/categories only.
3. `L2 Prioritize`: queueing/priority state only.
4. `L3 Draft`: create draft replies/forwards requiring approval.
5. `L4 Send/Forward`: autonomous outbound actions.

Promotion criteria for each level:

- measured precision/false-positive targets,
- account isolation checks passing,
- rollback path validated,
- explicit allowlists for high-impact actions.

### 9.5. AR processing model for inbox accessibility

Progressive exposure sequence:

1. `Glance`: one-line event summary (sender/thread/topic + urgency + trust hint).
2. `Context`: short explanation for why this item is surfaced now.
3. `Evidence`: linked thread/history, rule/model rationale, and confidence values.
4. `Action`: label/archive/draft/send controls with clear approval gates.

Feedback schema (per event/message):

- `novelty`: `new | update | duplicate`
- `trust`: `verified | plausible | speculative`
- `impact`: `act_now | watch | ignore`
- `intent`: `biz | invest | learn | personal`
- `signal_quality`: `high_signal | noise`

Semantic guardrail:

- `duplicate` means already seen in the same event/thread context, not "unimportant topic".

Exposure-bias controls:

- reserve exploration slots for low-exposure messages,
- track position/exposure and downstream outcomes,
- evaluate event recall and missed-important-message rate (not click/open only),
- separate model confidence from action authorization.

Implementation conclusion:
the hybrid architecture is the most defensible target state, but rollout should begin with Gmail-native reliability and add IMAP/fallback only after shared normalization and gate controls are stable.

## 10. Storage and Persistence Options

Storage design determines whether relevance and safety claims can be audited. The core decision is to keep provider mailboxes as message truth while using a separate durable layer for policy decisions, feedback, and action traces.

### 10.1. Storage backends observed in reviewed OSS

- Provider-native mailbox state:
  - Gmail labels, threads, drafts.
- File-based local storage:
  - JSON/JSONL snapshots,
  - Maildir tree (`cur/new/tmp`) where supported.
- Relational database:
  - SQLite/PostgreSQL for rules, runs, and audit history.
- Token/credential caches:
  - config-file token caches,
  - system keyring or external secret stores.

### 10.2. Practical storage mapping by role

- Message source of truth:
  - provider mailbox (Gmail/IMAP server).
- Processing/audit state:
  - relational DB (recommended) or structured file store for small-scale prototypes.
- Offline mailbox cache:
  - Maildir (where using Himalaya/maildir workflows).
- OAuth token cache:
  - dedicated writable cache file or secret manager-backed store.

### 10.3. Minimum record shape for cross-provider processing

- `account_id`
- `provider`
- `mailbox`
- `message_id`
- `thread_id`
- `from`, `to`, `subject`
- `received_at`
- `snippet`
- `body_text`
- `attachments_meta`
- `policy_decision`
- `decision_reason`
- `action_state`

Storage conclusion:
without a normalized, provider-independent audit record, any triage quality claim is weak and hard to reproduce. Durable decision traces are therefore mandatory, not optional.

## 11. OSS Project Analysis

The OSS review is focused on operational reuse, not feature sightseeing. The test is whether each component helps solve the core failure mode described earlier: low-attention review cadence (sometimes daily, sometimes weekly), high-noise inboxes, and missed critical service or personal messages. This section preserves implementation detail while folding it back into decision pressure: multi-account handling, auth reliability, storage posture, and explainable triage.

### 11.1. Evaluation frame for OSS reuse

The same component can be "good" in isolation and still wrong for this system. Each candidate was therefore assessed against these constraints:

- canonical truth should remain on provider servers (Gmail/IMAP), with local caches optional;
- protocol/auth complexity should be hidden behind stable OpenClaw boundaries;
- fallback behavior is required for OAuth expiry, disconnects, and API limits;
- support must scale from 2-4 active accounts to additional occasional accounts without cross-account leakage;
- storage design should preserve years of searchable history while keeping action/audit metadata queryable.

### 11.2. Connectivity and auth building blocks

#### 11.2.1. `pimalaya/himalaya`

`pimalaya` is the upstream project family around Himalaya (`homepage = https://pimalaya.org/` in `Cargo.toml`). In practice, Himalaya is not a single-purpose binary but a CLI surface over reusable crates (`email-lib`, `mml-lib`, `secret-lib`, `pimalaya-tui`). That structure matters for OpenClaw: we can treat it as a process-level connector with mature mailbox semantics, not as TypeScript-native code.

Implementation details observed in source:

- runtime and structure:
  - Rust CLI on `tokio`, feature-gated backends;
  - command families under `src/` for account/folder/envelope/flag/message flows.
- entrypoint behavior (`src/main.rs`):
  - tracing setup, `mailto:` path handling, argument parsing and dispatch;
  - defaults to envelope listing if no command is provided.
- command surface (`src/cli.rs`):
  - subcommands: `account`, `folder`, `envelope`, `flag`, `message`, `attachment`, `template`, `manual`, `completion`;
  - output modes include `plain` and `json`.
- config/control plane (`src/config.rs` + `pimalaya_tui`):
  - mergeable TOML config paths;
  - account backend selection (`imap`/`maildir`/`notmuch`);
  - send backend split (`smtp`/`sendmail`).
- feature gates (`Cargo.toml`):
  - `imap`, `maildir`, `notmuch`, `smtp`, `sendmail`, `oauth2`, `keyring`.
- dependencies and services:
  - core stack includes `tokio`, `clap`, `serde`, `email-lib`, `secret-lib`;
  - services include IMAP/SMTP plus optional OAuth2 and keyring.
- storage modes:
  - direct IMAP;
  - Maildir backend (`config.sample.toml`);
  - Notmuch DB path override.

OpenClaw fit: strong as a connector boundary for heterogeneous providers and local-first fallback. Main integration cost: subprocess orchestration, output normalization, and consistent secret policy across raw password, command retrieval, keyring, and OAuth variants.

#### 11.2.2. `simonrob/email-oauth2-proxy`

This project is best seen as auth infrastructure, not business logic. It is a Python proxy (`emailproxy.py`) with config-driven account definitions that can normalize OAuth for IMAP/POP/SMTP clients.

Technical profile:

- key libraries:
  - core: `cryptography`, `pyasyncore`, optional `pyjwt`, `prompt_toolkit`;
  - optional GUI: `pystray`, `pywebview`.
- services:
  - IMAP/POP/SMTP endpoints;
  - OAuth providers including Gmail and Microsoft via config.
- storage:
  - token cache in config by default;
  - optional separate cache store via `--cache-store`.

OpenClaw fit: high as a sidecar to unblock OAuth-constrained IMAP paths. It should stay out-of-process so failures and auth churn are isolated from gateway core logic.

#### 11.2.3. Maildir lineage and ecosystem support (beyond `himalaya`)

Maildir originates with D. J. Bernstein/qmail as a lock-free mailbox format (`tmp`, `new`, `cur`) with one-message-per-file and atomic delivery (`tmp` -> `new` -> `cur`). The design avoids in-place rewrites by encoding mutable state in filename flags. That lineage is still relevant because it gives durable, provider-independent storage behavior when online APIs fail or change.

Evolution and current support:

1. qmail Maildir baseline.
2. Courier Maildir++ (folders, quota metadata, shared folder conventions).
3. MTA/IMAP server support.
4. Sync/index/client ecosystem support.

Observed support matrix:

- `pimalaya/himalaya`: feature-gated `maildir` backend plus `imap`/`notmuch`.
- `pimalaya/neverest`: explicit `maildir` + `imap` backends with Gmail examples for local mirror, backup, and restore.
- Dovecot: explicit Maildir mailbox format (`cur/new/tmp`, Maildir++ layout in current docs).
- Postfix `local(8)`: qmail-compatible Maildir destination behavior.
- Exim `appendfile`: `maildir_format`, writes via `tmp` then rename to `new` (`SUPPORT_MAILDIR`).
- Courier `maildirmake`: explicit Maildir++ tools.
- notmuch: local one-message-per-file store expectation, typically Maildir-fed.
- isync/`mbsync`: IMAP <-> Maildir synchronization (`MaildirStore`).
- Mutt: direct Maildir read/write model.
- Thunderbird: optional Maildir mode, documented with known caveats and disabled-by-default posture.

OpenClaw implication: Maildir remains a viable fallback substrate, especially when you want long-term local search and API independence. The tradeoff is operational overhead for store lifecycle, index maintenance, and dedupe control at large historical volumes.

#### 11.2.4. Maildir ingress and sync implementations to review (besides Himalaya)

Candidates and role split:

- `pimalaya/neverest`:
  - role: IMAP <-> Maildir sync, backup, and restore sidecar;
  - strength: Gmail examples, OAuth2/keyring patterns, and a cleaner fit than a generic mail client when local mirror semantics are the goal;
  - limitation: Rust process boundary and sync-state operational overhead.
- Python stdlib `mailbox.Maildir`:
  - role: local read/write API;
  - strength: no external dependency, canonical Maildir primitive;
  - limitation: no network auth/sync/triage orchestration.
- `getmail6`:
  - role: POP3/IMAP retrieval and delivery to local stores;
  - strength: mature ingress/delivery focus;
  - limitation: not a full mailbox operations platform.
- `offlineimap3`:
  - role: IMAP <-> Maildir synchronization;
  - strength: bidirectional mirror semantics;
  - limitation: operational sync complexity; weak alignment with explainable action-policy layers.
- `isync` / `mbsync`:
  - role: lightweight IMAP <-> Maildir synchronization;
  - strength: simpler Maildir-first workflow and smaller operational surface than the larger sync stacks;
  - limitation: fewer Gmail-specific setup aids and less explicit policy/audit framing than the sidecar-oriented candidates.
- `cloud_mdir_sync`:
  - role: cloud API <-> Maildir synchronization;
  - strength: useful where API constraints beat IMAP;
  - limitation: narrower provider scope and smaller ecosystem.

Comparison to `pimalaya/himalaya`:

- `pimalaya/himalaya` provides a broad read/manage/send CLI with IMAP/SMTP/Sendmail and optional OAuth2/keyring.
- `pimalaya/neverest` is the clearest Pimalaya-side fit for Gmail -> Maildir fetch when the goal is a durable local mirror rather than human mailbox interaction.
- `mailbox.Maildir` is local-only and useful as a primitive helper rather than a transport.
- `getmail6` and `offlineimap3` are strong ingress/sync sidecars but not complete action layers.
- `isync` / `mbsync` is the lightweight Maildir-first sync reference when the goal is a simple local mirror rather than richer account onboarding.
- `cloud_mdir_sync` is situational and provider-specific.

Weighted review order (integration fit 30, reliability 25, observability 20, auth/security 15, maintenance risk 10):

- `pimalaya/himalaya` (86)
- `pimalaya/neverest` (78)
- `getmail6` (71)
- `isync` / `mbsync` (69)
- `offlineimap3` (67)
- `mailbox.Maildir` (58)
- `cloud_mdir_sync` (54)

Practical sequence:

1. Validate Himalaya process boundary + error normalization contract.
2. Validate `neverest` as the first Gmail -> Maildir mirror candidate when durable local history is required.
3. Prototype `getmail6` as the simpler ingress sidecar into the same normalized schema.
4. Keep `isync` / `mbsync` as the lightweight Maildir-first alternative for simpler mirror workflows.
5. Add `offlineimap3` only where full local mirror semantics are required.
6. Use stdlib `mailbox.Maildir` for glue code/tests, not primary transport.
7. Evaluate `cloud_mdir_sync` only when IMAP paths are non-viable.

### 11.3. Sorting and triage workers

The sorting projects are not equivalent products. Some are retrieval+classification demos, some are partial pipelines, and some provide reusable labeling logic. The key question is not "which one is smartest," but which ideas can improve daily triage quality while preserving explainability.

#### 11.3.1. `jan-janssen/gmailsorter`

`gmailsorter` is the strongest supervised-labeling reference in this set. It is a Python package split into `base`, `google`, `ml`, `daemon`, and `webapp` modules, with CLI entry points for daemon/web operation. It uses Gmail libraries (`google-api-python-client`, `google-auth`, `google-auth-oauthlib`), ML/data stack (`scikit-learn`, `pandas`, `numpy`), and persistence via `sqlalchemy`, with optional Flask/Gunicorn web layers. It targets Gmail API and persists training/runtime state in SQL-backed workflow (SQLite examples included). Reuse stance: borrow supervised feedback loop semantics, not full system.

#### 11.3.2. `0xrushi/emailgenius`

`emailgenius` is a lightweight Python + Streamlit app (`src/main.py`, `src/utils.py`) with IMAP parsing plus prompt-driven categorization flow. Dependencies include `imap-tools`, `imaplib`, `beautifulsoup4`, `openai==0.28`, `langchain`, `streamlit`, `pandas`, and `numpy`, with Gmail API helper routines in `utils.py`. It touches IMAP (`imap.gmail.com`), OpenAI-compatible inference, and Gmail label operations. Storage is mostly local snapshots (`data/email_data.json`, JSONL-like appends) and local credential cache under `~/.credentials/...json`. Reuse stance: useful interaction prototype, low production maturity.

#### 11.3.3. `KrishT97/MailSift-AI`

`MailSift-AI` is a script-oriented Python project with `modules/` focused on spam detection and preference scoring. It uses `torch`, `transformers`, `datasets`, `safetensors`, `pandas`, and `numpy`. Its main operational path is local model inference rather than robust live provider integration. Data and feedback are local JSON artifacts (`data/emails_sample.json`, `data/user_feedback.json`) plus local model artifacts under `models/`. Reuse stance: strong conceptual reference for two-stage triage (spam gate then relevance), weak as mailbox execution layer.

#### 11.3.4. `andywalters47/clearmail`

`clearmail` provides Node scripts (`processEmails.js`, `analyzeEmail.js`) with config-driven behavior and simple automation loops. Core dependencies include `imap`, `mailparser`, `openai`, `express`, `js-yaml`, and `pm2`. It relies on IMAP (with Gmail-focused defaults) and OpenAI chat completions. Persistence is minimal: timestamp checkpointing and provider-side mailbox labels/folders. Reuse stance: useful prompt/rule experiment surface, but security and maintenance posture limit direct adoption.

#### 11.3.5. `manlikeNacho/gmailLoader`

`gmailLoader` is a Node/Express Gmail fetch-and-classify flow with `googleapis`, `@react-oauth/google`, `openai`, `express`, and `winston`. It integrates Gmail API and OpenAI API but appears to process primarily in-memory request/response flows without strong durable state. Reuse stance: decomposition reference only; low priority for direct reuse.

### 11.4. Full-stack reference architecture

#### 11.4.1. `elie222/inbox-zero`

`inbox-zero` is the most complete architecture reference in this set: a TypeScript monorepo (`apps/web`, `apps/unsubscriber`, shared packages) with explicit workflow docs. Stack includes Next.js/React, Prisma, Gmail APIs, Redis/Upstash background workflows, and model integrations via `@ai-sdk/*`. Services include Gmail webhook/watch semantics and optional Outlook paths. Storage is explicit and production-like: PostgreSQL (Prisma), Redis (queue/cache/state), and provider mailbox as message source of truth.

Reuse stance: high-value pattern source for taxonomy, policy gates, audit semantics, and workflow decomposition. It should be consumed as clean-room design input, not transplanted wholesale.

### 11.5. OSS synthesis: what this means for the current problem

The reviewed OSS points toward a hybrid ingestion strategy, but not because "hybrid" is fashionable. It is the only path that cleanly handles current realities: Gmail OAuth friction today, IMAP variability across secondary accounts, and the need to preserve long-history search while avoiding daily triage overload.

The strongest shape is:

- provider mailboxes remain canonical message stores;
- optional local Maildir mirrors are used for resilience and historical analysis;
- a relational audit store captures decisions, feedback, and explanation traces;
- file-based message bodies and relational metadata remain intentionally split to preserve interoperability and queryable policy history;
- ingestion supports periodic idempotent catch-up pulls (for example, a few runs per day) to match low active review cadence;
- deterministic filtering and bucketing run before model inference;
- LLM classification is limited to ambiguous residuals and guarded by abstain thresholds;
- normalized event contracts should be designed so future channels (for example Discord/X/Telegram PMs) can reuse the same policy and feedback layers.

### 11.6. Key open questions, gaps, and pending OSS decisions

Open questions:

1. Should IMAP fallback stay strictly secondary, or become co-primary for multi-provider ingestion once OAuth sidecars are stable?
2. What minimum adapter contract is required for any connector (`gog`, Himalaya, sidecars): idempotent fetch, message identity, retry policy, and typed error classes?
3. How much historical backfill is needed to reach useful personalization without overwhelming storage and compute?
4. Should a cross-channel event schema be defined now (email + future PM sources) or deferred until email triage quality is stable?

Obvious gaps in current evidence:

1. No benchmark yet for missed-critical-message rate on low-attention review cadence (daily-to-weekly usage pattern).
2. No measured operational envelope for large archive ingestion (spam-heavy, multi-year histories across many accounts).
3. No validated conflict-resolution model between provider-side states (labels/folders/flags) and local derived metadata.
4. No storage growth/cost model yet for combining deep email history with future multi-year chat/PM archives.

Pending decision points:

1. Connector baseline: `gog` first with Himalaya sidecar fallback, or dual ingestion from the start.
2. Storage split: minimal Maildir mirror for fallback vs full historical mirror by default.
3. Learning mode: supervised label-learning (`gmailsorter` style) as default personalization path vs LLM-first residual labeling.
4. Promotion gate: exact thresholds required before moving from `L1` label-only behavior to `L2` prioritization.
5. Multi-account scope at launch: only routine 2-4 accounts first, or include occasional long-tail accounts with lower priority weights.
6. Ingestion cadence policy: Gmail watch + periodic catch-up for all connectors vs pure periodic batch for operational simplicity.

OSS conclusion:
the practical near-term mix is connector robustness plus deterministic policy plus auditable residual AI, not a single end-to-end OSS adoption.

## 12. Commercial Vendor Coverage

Source basis: collected review in `../Emails/Emails.md`. Pricing and tiers can change. The goal here is to extract stable operating semantics that improve real inbox outcomes, not to mirror marketing pages or chase feature parity.

### 12.1. Directly relevant vendors

#### 12.1.1. Fyxer

Fyxer emphasizes AI triage, drafting, and team workflows. Useful imports are actionable label language, category shaping, and structured action outcomes (including voice-style drafting experiences). Captured pricing snapshot: Starter `USD 30/mo` (`USD 22.50` annualized), Pro `USD 50/mo` (`USD 37.50` annualized), Enterprise via sales. Collected vendor signal: founded `2023`, claims `100,000+` users.

#### 12.1.2. SaneBox

SaneBox is the clearest deterministic-filter benchmark in this set. The valuable pattern is predictable bucket semantics (defer/no-reply/digest) that reduce daily decision fatigue without requiring constant annotation. Captured pricing snapshot: plans starting around `USD 4.95/mo`, with higher multi-account tiers. Collected signal: long-running product with public origin story around `2010`.

#### 12.1.3. Cora

Cora targets personal triage and draft support. Useful imports are important-first screening and briefing UX with conversational rule shaping. Captured pricing snapshot: `USD 20/mo` from prior pass. Key caveat: limited transparency in currently collected data around company profile and technical controls.

#### 12.1.4. Shortwave

Shortwave is primarily a workflow UX benchmark: split views, bundles, and pinned-thread emphasis. Those patterns align well with progressive exposure goals when users need fast scanning of large noisy inboxes. Captured pricing snapshot: Business `USD 24`, Premier `USD 36`, Max `USD 100` per seat/month (annual-billing view from prior capture). Collected signal: public coverage references seed funding and broad adoption claims.

### 12.2. Team and adjacent vendors

#### 12.2.1. Hiver

Hiver is strongest for shared inbox operations: assignment, SLA accountability, and routing transparency. For this effort, it is primarily a terminology and control-plane reference for future team mode rather than single-user inbox automation. Captured pricing snapshot: Free, Lite `USD 19`, Growth `USD 29`, Pro `USD 49`, Elite via sales (annual view). Collected signal: claims `10,000+` teams and high review volume.

#### 12.2.2. Clean Email

Clean Email is most useful as cleanup/unsubscribe/category UX reference. The major take-away is user-facing simplification of bulk operations and category hygiene. Pricing data in the collected pass was less stable due dynamic rendering, so it should be treated as terminology/workflow input first.

#### 12.2.3. Seventh Sense

Seventh Sense focuses on outbound send-time optimization in marketing systems. It is adjacent, not a primary benchmark for inbound personal triage. Pricing posture in the collected pass was calculator-driven rather than fixed tiers.

### 12.3. Terminology and control taxonomy to standardize

To make policy, UI labels, and model prompts interoperable, OpenClaw should standardize these terms across config and runtime explanations:

- content class: `receipt`, `newsletter`, `notification`, `outreach`, `personal`, `support`;
- priority state: `urgent`, `today`, `later`, `ignore`;
- action type: `label`, `archive`, `prioritize`, `draft`, `send`, `forward`, `digest`;
- ownership state: `unassigned`, `assigned`, `waiting`, `done`;
- confidence bands: `high`, `medium`, `low` with explicit threshold mapping.

### 12.4. AR feature imports from vendor patterns

Behavior imports to prioritize:

1. Deterministic bucket semantics from SaneBox-like flows (`Later`, `NoReply`, digest-first).
2. Team ownership/SLA visibility from Hiver-like patterns where shared inboxes exist.
3. Draft-assist + actionable labels from Fyxer/Cora patterns, with strict OpenClaw approval gates.
4. Split/bundle/pin presentation from Shortwave-like interfaces for progressive exposure.
5. Rule taxonomy plus action audit semantics inspired by `inbox-zero`, implemented clean-room.
6. Supervised label-learning fallback, aligned with `gmailsorter`-style personalization loops.

Adoption rule:

- import behavioral semantics and taxonomy first;
- import code only with acceptable license, coupling, and security posture.

### 12.5. Commercial synthesis: what matters for outcomes

Commercial tools repeatedly show that user trust comes more from predictable state transitions than from model novelty. In practice, users tolerate imperfect classification if the system is legible, reversible, and low-friction to correct. That directly matches this project’s needs: reduce multi-hour inbox cleanup while preserving confidence that critical reminders and personal outreach will still surface.

For low-attention operators, the most transferable pattern is progressive exposure with explicit "why surfaced" rationale and one-click disposition. For multi-account users, stable buckets and digest layers matter more than aggressive autonomous actions.

### 12.6. Key open questions, gaps, and pending vendor-informed decisions

Open questions:

1. Which minimum interaction vocabulary should ship first so feedback remains quick but expressive (icons + free text + click-through rationale)?
2. How much manual annotation burden is acceptable before users disengage from feedback loops?
3. Should enterprise/shared-inbox semantics (assignment/SLA) be in scope now or deferred until after single-user reliability targets are met?

Obvious gaps:

1. No direct usability benchmark yet comparing icon-rich UI feedback vs simple thumbs/stars in this workflow.
2. No measured evidence on whether richer feedback taxonomies materially improve prioritization quality for this user profile.
3. Incomplete trust/compliance signal coverage for some vendors (notably Cora transparency in current dataset).

Pending decision points:

1. UI posture: CLI-first interaction with compact semantic controls vs early GUI with richer visual cues.
2. Feedback schema: fixed ontology only vs hybrid ontology + free-text rationale for later LLM interpretation.
3. Product scope boundary: triage/prioritization first vs early inclusion of draft/reply workflows.

Vendor conclusion:
the strongest transferable value is explainable workflow design and user override ergonomics; model choice is secondary until those controls are stable.

## 13. Recommended Near-term Plan for the Email Project

This plan is intentionally step-based rather than date-based. The ordering reflects dependency structure: trustable ingestion and governance first, richer automation later.

1. Unblock Gmail OAuth and complete first mailbox read path with `gog`.
2. Validate one IMAP account path (Himalaya or equivalent) as fallback.
3. Implement `L0` and `L1` only: observe + label.
4. Add event dedupe and progressive exposure presentation (`glance -> context -> evidence -> action`).
5. Add relational audit store plus explanation fields (`why surfaced`, `why action chosen`).
6. Introduce AI triage only on unresolved messages after deterministic filters.
7. Capture AR feedback dimensions in-review UI/logs before enabling `L2+`.
8. Run two-account isolation + exposure-bias evaluation matrix before enabling `L2+`.
9. Promote to `L3` drafts only after precision, false-positive, and missed-important-message thresholds are met.

### 13.1. Execution program (build while learning)

Use parallel workstreams so implementation progress also produces hands-on insight into tools, interfaces, and operational constraints.

### Track A: Google/Gmail interface and API immersion

Goal:

- understand Gmail behavior at UI, API, and policy layers before scaling automation.

Actions:

1. Stand up a 2-3 account test bed:
   - one primary Gmail account,
   - one noisy newsletter-heavy account,
   - one edge-case account (high attachment volume or thread depth).
2. Capture Gmail UI behavior matrix:
   - labels vs categories vs tabs,
   - stars/importance markers/snooze,
   - thread behavior, search operators, and filters.
3. Exercise Gmail API and Pub/Sub lifecycle:
   - watch creation and renewal cadence,
   - webhook delivery semantics and retry behavior,
   - failure modes (expired watch, auth revoke, quota boundary).
4. Build a "Google constraints" sheet:
   - consent/scope limits,
   - org-policy restrictions,
   - practical setup pitfalls and recovery steps.

Deliverables:

- Gmail settings/behavior matrix,
- API watch lifecycle checklist,
- known-failure playbook for OAuth/PubSub/webhook.

### Track B: Chrome extension and client-side workflow study

Goal:

- learn what extensions expose that native Gmail and server-side automation do not.

Actions:

1. Define extension classes to test:
   - triage/sorting overlays,
   - compose/draft helpers,
   - follow-up/reminder and link-tracking tools.
2. Evaluate each extension with a fixed checklist:
   - required permissions and data-access scope,
   - category/priority controls,
   - auditability and override ergonomics,
   - export/interoperability with OpenClaw workflow.
3. Record "net-new capability":
   - what this extension adds that OpenClaw should emulate,
   - what should remain extension-side vs backend-side.

Deliverables:

- extension comparison matrix,
- keep/avoid recommendations with security notes.

### Track C: Commercial vendor operations benchmarking

Goal:

- extract operationally useful patterns from leading products, not just marketing terminology.

Targets:

- Fyxer, SaneBox, Cora, Shortwave, Hiver (from existing vendor review).

Actions:

1. Run each tool on the same sampled inbox window.
2. Measure default behavior and configurable behavior separately.
3. Document where each tool is strongest:
   - deterministic filtering,
   - priority shaping,
   - draft quality,
   - team routing/SLA,
   - explainability and user override.
4. Capture failure/annoyance cases:
   - false-priority promotions,
   - hidden automation,
   - poor recovery and rollback ergonomics.

Deliverables:

- pattern-import table (adopt/adapt/avoid),
- vendor operation notes tied to AR metrics.

### Track D: Himalaya architecture and integration mapping

Goal:

- convert Himalaya from "reviewed component" into a concrete fallback integration option.

Actions:

1. Map structure to integration boundaries:
   - account config and auth,
   - message listing/read paths,
   - send/draft operations,
   - backend selection (`imap`, `maildir`, `notmuch`).
2. Validate one full roundtrip in sandbox:
   - account configure,
   - folder list,
   - message read,
   - draft/send in controlled mailbox.
3. Define process boundary contract for OpenClaw:
   - command/API interface,
   - error normalization,
   - token/secret handling and storage policy.

Deliverables:

- Himalaya adapter contract spec,
- fallback runbook for non-Gmail providers.

### Track E: AI/LLM triage practicality for large text bodies

Goal:

- make classification robust on long threads and large-body messages without uncontrolled cost or hallucinated actions.

Actions:

1. Build representative corpus slices:
   - long threads,
   - transactional/noise-heavy mail,
   - multi-topic and attachment-heavy messages.
2. Implement staged processing:
   - deterministic filters first,
   - LLM only for ambiguous residual set,
   - abstain path when confidence is below threshold.
3. Add long-text controls:
   - thread-aware chunking and context windows,
   - header/body weighting,
   - truncation and summarization policies.
4. Evaluate with offline replay harness:
   - precision/recall for `act_now`,
   - false-positive rate on high-impact actions,
   - missed-important-message rate,
   - cost-per-1,000 messages by model tier.

Deliverables:

- model/prompt policy for `L0-L3`,
- confidence thresholds and abstain criteria,
- replay benchmark report.

### 13.2. Suggested execution sequence (step-based)

Step 1:

- baseline corpus, taxonomy freeze, and instrumentation setup.

Step 2:

- Gmail interface/API/PubSub validation and failure-playbook capture.

Step 3:

- extension and vendor operations comparison with fixed scenarios.

Step 4:

- Himalaya fallback roundtrip and adapter boundary definition.

Step 5:

- AI/LLM residual triage experiments and threshold tuning.

Step 6:

- integrated pilot (`L0-L1` production-like), gate review for `L2`.

### 13.3. Gate metrics before each promotion step

Minimum metrics to move between action levels:

- account-isolation pass rate: no cross-account action leakage,
- duplicate-collapse rate: event-level dedupe catches repeated wrappers,
- `act_now` precision and false-positive thresholds met,
- missed-important-message rate below agreed ceiling,
- explanation completeness: each action has traceable `why surfaced` + `why action`.

Plan conclusion:
promotion should be earned by measured decision quality and safety evidence, not by integration completeness or model performance in isolation.

## 14. OSS Maturity Snapshot (Collected)

Snapshot basis: prior collection in `../Emails/Emails.md`.
This section summarizes practical maturity signals for prioritization, then applies explicit confidence scoring to OpenClaw-specific integration candidates.

- Higher maturity in this set:
  - `inbox-zero` (~10k stars, active),
  - `himalaya` (~5k stars, active),
  - `email-oauth2-proxy` (~1k stars, active).
- Medium or niche:
  - `gmailsorter` (small community but recent activity).
- Lower maturity / reference-only posture:
  - `clearmail`, `emailgenius`, `gmailLoader`, `MailSift-AI`.

### 14.1 Explicit third-party OpenClaw email skills and integrations (online scan, 2026-03-13)

This scan focused on explicitly named OpenClaw email/Gmail integrations with public package/repo evidence.

Decision guidance from this scan:

- Choose `@mcinteerj/openclaw-gmail` when the primary need is focused Gmail operations with lower operational overhead.
- Choose `@agenticmail/openclaw` when the need includes broader email+SMS+multi-agent orchestration and you can absorb higher system complexity.
- Treat other candidates as exploratory inputs until maintenance/documentation quality improves.

| Candidate                                       | Type                                     | Evidence                                                             | Signal snapshot                                                                              | Validation status                                                                                                     |
| ----------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@agenticmail/openclaw`                         | OpenClaw plugin (email + SMS)            | npm package + GitHub repo + substantial README + packaged `SKILL.md` | npm last-month downloads: 5510; repo stars: 68                                               | `High`: explicit, installable, documented                                                                             |
| `@mcinteerj/openclaw-gmail`                     | OpenClaw Gmail channel plugin            | npm package + GitHub repo + detailed setup/config docs               | npm last-month downloads: 2345; repo stars: 3                                                | `High`: explicit, installable, documented                                                                             |
| `naoterumaker/openclaw-gog-skills`              | Skill pack (GitHub)                      | GitHub repo + README with Gmail skill and setup steps                | repo stars: 2                                                                                | `Medium`: explicit and documented, but no npm package evidence in this scan                                           |
| `@nextclaw/channel-plugin-email`                | OpenClaw-compatible email plugin package | npm package exists with installable tarball                          | npm last-month downloads: 2310; README is minimal; no linked public repo in package metadata | `Low-Medium`: explicit package, weak documentation/audit trail                                                        |
| `commune-dev/commune-openclaw-email-quickstart` | Quickstart skills/repo                   | GitHub repo with OpenClaw email/SMS quickstart + skill layout        | repo stars: 0                                                                                | `Low-Medium`: explicit and documented as quickstart, but low adoption signal and no npm package evidence in this scan |

### 14.2 Curation gap and noise profile

- Current OpenClaw community plugin listing has no email plugin entry; only WeChat is listed today.
- GitHub keyword search for `openclaw email` returns many low-signal repositories (often zero stars, sparse metadata, or minimal docs).
- Practical implication: package existence alone is not enough; require explicit validation before operational adoption.

### 14.3 Future scan checklist (to keep this section reliable)

For each candidate integration:

1. Confirm package metadata (`npm view`) includes repository/homepage and recent publish activity.
2. Inspect package tarball contents (`npm pack`) for non-trivial README/config/schema/tests.
3. Verify source repository exists and is active (`gh repo view` stars, pushedAt, updatedAt).
4. Confirm explicit OpenClaw install path exists in docs (`openclaw plugins install ...` or equivalent).
5. Record usage and maintenance signals separately from quality judgment (downloads, stars, update recency).
6. Classify confidence (`High`, `Medium`, `Low-Medium`, `Low`) and keep unknowns explicit.

Maturity conclusion:
current evidence supports two strong near-term candidates (`@agenticmail/openclaw`, `@mcinteerj/openclaw-gmail`), with the rest better treated as exploratory inputs pending stronger maintenance and documentation signals.

## 15. Open Questions

- Should IMAP remain fallback-only or become co-primary for non-Gmail accounts (including Yahoo paths)?
- Which model stack is approved for high-trust actions vs low-risk summarization?
- What minimum explanation fields are mandatory before any action above `L1`?
- What attachment/body truncation policy is required by default?
- What exploration budget is acceptable before user trust declines?
- Which AR feedback dimensions are mandatory at `L2+` review gates?

## 16. References

- OpenClaw Gmail Pub/Sub: `docs/automation/gmail-pubsub.md`
- OpenClaw webhooks: `docs/automation/webhook.md`
- OpenClaw hooks: `docs/hooks.md`
- OpenClaw community plugins listing: `https://docs.openclaw.ai/plugins/community`
- Workspace OSS analysis: `../Emails/Emails.md`
- `pimalaya/himalaya`: `../Emails/himalaya`
- `simonrob/email-oauth2-proxy`: `../Emails/email-oauth2-proxy`
- `jan-janssen/gmailsorter`: `../Emails/gmailsorter`
- `0xrushi/emailgenius`: `../Emails/emailgenius`
- `KrishT97/MailSift-AI`: `../Emails/MailSift-AI`
- `andywalters47/clearmail`: `../Emails/clearmail`
- `manlikeNacho/gmailLoader`: `../Emails/gmailLoader`
- `elie222/inbox-zero`: `../Emails/inbox-zero`
- npm `@agenticmail/openclaw`: `https://www.npmjs.com/package/@agenticmail/openclaw`
- npm `@mcinteerj/openclaw-gmail`: `https://www.npmjs.com/package/@mcinteerj/openclaw-gmail`
- npm `@nextclaw/channel-plugin-email`: `https://www.npmjs.com/package/@nextclaw/channel-plugin-email`
- `agenticmail/agenticmail`: `https://github.com/agenticmail/agenticmail`
- `mcinteerj/openclaw-gmail`: `https://github.com/mcinteerj/openclaw-gmail`
- `naoterumaker/openclaw-gog-skills`: `https://github.com/naoterumaker/openclaw-gog-skills`
- `commune-dev/commune-openclaw-email-quickstart`: `https://github.com/commune-dev/commune-openclaw-email-quickstart`
- npm downloads API (`@agenticmail/openclaw`, last-month): `https://api.npmjs.org/downloads/point/last-month/%40agenticmail%2Fopenclaw`
- npm downloads API (`@mcinteerj/openclaw-gmail`, last-month): `https://api.npmjs.org/downloads/point/last-month/%40mcinteerj%2Fopenclaw-gmail`
- npm downloads API (`@nextclaw/channel-plugin-email`, last-month): `https://api.npmjs.org/downloads/point/last-month/%40nextclaw%2Fchannel-plugin-email`
- Fyxer: `https://www.fyxer.com`
- SaneBox: `https://www.sanebox.com`
- Cora: `https://cora.computer`
- Shortwave: `https://www.shortwave.com`
- Hiver: `https://hiverhq.com`
- Clean Email: `https://clean.email`
- Seventh Sense: `https://www.theseventhsense.com`
- Maildir format (qmail): `https://cr.yp.to/proto/maildir.html`
- qmail reliability note (Maildir context): `https://cr.yp.to/qmail/venema.html`
- Courier Maildir++ tooling: `https://www.courier-mta.org/maildrop/maildirmake.html`
- Dovecot Maildir format: `https://doc.dovecot.org/2.4.0/core/config/mailbox/formats/maildir.html`
- Postfix local Maildir delivery: `https://manpages.ubuntu.com/manpages/oracular/man8/local.8postfix.html`
- Exim appendfile Maildir format: `https://www.exim.org/exim-html-current/doc/html/spec_html/ch-the_appendfile_transport.html`
- notmuch mail store guidance: `https://notmuchmail.org/getting-started/`
- isync/mbsync manual: `https://isync.sourceforge.io/mbsync.html`
- Mutt manual: `https://www.mutt.org/doc/manual/`
- Thunderbird Maildir support note: `https://support.mozilla.org/kb/maildir-thunderbird`
- Python stdlib mailbox/Maildir docs: `https://docs.python.org/3/library/mailbox.html`
- Neverest repo: `https://github.com/pimalaya/neverest`
- getmail6 docs: `https://getmail6.org/documentation.html`
- getmail6 destination config: `https://getmail6.org/configuration.html`
- isync homepage: `https://isync.sourceforge.io/`
- isync GitHub mirror: `https://github.com/gburd/isync`
- offlineimap3 repo: `https://github.com/OfflineIMAP/offlineimap3`
- cloud_mdir_sync repo: `https://github.com/jgunthorpe/cloud_mdir_sync`

## 17. Appendix: Protocol Controls, States, Fields, and Schema Cross-reference

This appendix standardizes terms across IMAP, SMTP, POP, Gmail API, and message-level metadata.  
Goal: preserve aliases and field names for long-term matching, migration, and policy portability.

### 17.1. Protocol control and state model

| Layer                         | Core controls/commands                                                                                                                                           | Session or lifecycle states                                                                        | Status/response model                                                              | Organization primitives                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| IMAP                          | `CAPABILITY`, `STARTTLS`, `AUTHENTICATE`/`LOGIN`, `SELECT`/`EXAMINE`, `SEARCH`, `FETCH`, `STORE`, `COPY`, `MOVE`, `APPEND`, `EXPUNGE`, `IDLE`, `CLOSE`, `LOGOUT` | `Not Authenticated`, `Authenticated`, `Selected`, `Logout`                                         | tagged + untagged responses (`OK`, `NO`, `BAD`, `BYE`, etc.)                       | mailbox/folder, UID + sequence number, flags/keywords         |
| SMTP (`SMTL` alias preserved) | `EHLO`/`HELO`, `STARTTLS`, `AUTH`, `MAIL FROM`, `RCPT TO`, `DATA`, `RSET`, `NOOP`, `QUIT`                                                                        | greeting -> envelope transaction -> data -> termination                                            | SMTP reply classes (`2xx`, `3xx`, `4xx`, `5xx`) and optional enhanced status codes | envelope sender/recipients; transport-level transaction state |
| POP3                          | `USER`, `PASS`, `APOP`, `STAT`, `LIST`, `UIDL`, `RETR`, `TOP`, `DELE`, `RSET`, `NOOP`, `QUIT`                                                                    | `AUTHORIZATION`, `TRANSACTION`, `UPDATE`                                                           | line status (`+OK` / `-ERR`)                                                       | mailbox message list, message number, UIDL                    |
| Gmail API                     | `users.messages.*`, `users.threads.*`, `users.labels.*`, `users.history.list`, `users.watch`, `users.stop`                                                       | resource lifecycle (`new/read/archived/trashed/spam`) + watch lifecycle (`active/expired/stopped`) | HTTP status + structured API errors                                                | `threadId`, `labelIds`, `historyId`, message resource fields  |

### 17.2. Message headers and MIME field map

| Canonical concept      | Header terms (preserve for matching)                                                                                          | IMAP/POP source                     | Gmail API source                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| Message identity       | `Message-ID`, `Message-Id`                                                                                                    | RFC 5322 headers via `FETCH`/`RETR` | `payload.headers[]` (`Message-ID`)             |
| Thread linkage         | `In-Reply-To`, `References`                                                                                                   | headers                             | `payload.headers[]` + `threadId`               |
| Sender                 | `From`, `Sender`, `Reply-To`, `Return-Path`                                                                                   | headers                             | `payload.headers[]`                            |
| Recipients             | `To`, `Cc`, `Bcc`                                                                                                             | headers                             | `payload.headers[]`                            |
| Subject                | `Subject`                                                                                                                     | headers                             | `payload.headers[]`                            |
| Sent/received time     | `Date`, `Received` chain                                                                                                      | headers                             | `payload.headers[]`, `internalDate`            |
| MIME envelope          | `MIME-Version`, `Content-Type`, `Content-Transfer-Encoding`, `Content-Disposition`, `Content-ID`                              | headers/body parts                  | `payload.mimeType`, `payload.parts[]`, headers |
| Priority hints         | `Importance`, `Priority`, `X-Priority`                                                                                        | headers (if present)                | headers (if present)                           |
| Authentication results | `Authentication-Results`, `ARC-Authentication-Results`, `DKIM-Signature`, `Received-SPF`, `ARC-Seal`, `ARC-Message-Signature` | headers (if present)                | headers (if present)                           |

### 17.3. Core organization and state terms (alias-preserving dictionary)

| Canonical term | Preserved aliases/variants                | Typical source systems                    |
| -------------- | ----------------------------------------- | ----------------------------------------- |
| mailbox        | folder, mail folder, box                  | IMAP, POP clients, Himalaya               |
| label          | tag, category, system label               | Gmail API, UI tools                       |
| message        | email, mail item, record                  | all                                       |
| thread         | conversation, chain                       | Gmail, UI tools                           |
| read state     | read, unread, seen, unseen                | IMAP flags, Gmail labels                  |
| priority       | important, urgent, high-priority, starred | Gmail/vendor tools                        |
| archive        | archived, all mail                        | Gmail, IMAP folders                       |
| delete state   | trash, bin, deleted, expunged             | Gmail, IMAP/POP                           |
| junk state     | spam, junk, bulk                          | Gmail, vendor tools                       |
| outbound prep  | draft, outbox                             | Gmail/SMTP workflows                      |
| ownership      | unassigned, assigned, waiting, done       | team tools (for example Hiver-like flows) |
| follow-up      | snoozed, remind later, deferred           | Gmail/vendor tools                        |

### 17.4. Email security terminology map (DNS, MX, SPF, DKIM, DMARC)

Keep all terms below as first-class aliases for matching and policy logic.

| Domain             | Canonical term                   | Preserved aliases/fields/tags                                                           | Meaning in processing                                            | Defining RFCs                  |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------ |
| DNS                | DNS answer state                 | `NOERROR`, `NXDOMAIN`, `SERVFAIL`, `REFUSED`, `NODATA`                                  | resolver outcome that conditions auth evaluation confidence      | RFC 1034, RFC 1035             |
| DNS                | DNS record classes used by email | `MX`, `TXT`, `A`, `AAAA`, `CNAME`, `NS`, `SOA`, `PTR`, `TTL`                            | transport/auth dependencies for routing and domain authorization | RFC 1034, RFC 1035             |
| SMTP + DNS         | MX routing record                | exchanger, preference, priority, "mail exchanger", `Null MX`                            | host selection and fallback behavior for inbound routing         | RFC 5321 (Section 5), RFC 7505 |
| SPF                | SPF policy record                | `v=spf1`, `a`, `mx`, `ip4`, `ip6`, `include`, `exists`, `ptr`, `all`, `redirect`, `exp` | domain-level sender authorization policy                         | RFC 7208                       |
| SPF                | SPF evaluation result            | `pass`, `fail`, `softfail`, `neutral`, `none`, `temperror`, `permerror`                 | envelope sender authorization result used by DMARC/SPAM logic    | RFC 7208                       |
| DKIM               | DKIM signature header            | `DKIM-Signature`, `v`, `a`, `d`, `s`, `h`, `bh`, `b`, `c`, `i`, `l`, `t`, `x`, `q`, `z` | message integrity + signing identity metadata                    | RFC 6376                       |
| DKIM               | DKIM DNS key record              | selector record tags `v`, `k`, `p`, `t`, `n`                                            | public-key discovery and key policy flags                        | RFC 6376                       |
| DMARC              | DMARC policy record              | `v=DMARC1`, `p`, `sp`, `pct`, `adkim`, `aspf`, `fo`, `rf`, `ri`, `rua`, `ruf`           | domain policy + reporting and alignment controls                 | RFC 7489                       |
| DMARC              | DMARC disposition/alignment      | `none`, `quarantine`, `reject`, relaxed/strict alignment (`aspf`, `adkim`)              | policy action recommendation and pass/fail alignment state       | RFC 7489                       |
| Auth result header | Auth trace header                | `Authentication-Results` with `spf=`, `dkim=`, `dmarc=` tokens                          | normalized evidence field for downstream decisions and auditing  | RFC 8601                       |

### 17.5. Canonical AR processing schema (cross-provider)

Use this structure as normalization target before policy and model decisions.

Identifiers and routing:

- `account_id`
- `provider` (`gmail`, `imap`, `pop`, etc.)
- `mailbox_id`
- `mailbox_name`
- `provider_message_id`
- `provider_thread_id`
- `message_id` (normalized internal id)
- `thread_id` (normalized internal id)
- `history_cursor` (`historyId` or equivalent)
- `uid` / `uidvalidity` / `uidl` when available

Message envelope and headers:

- `from`
- `to`
- `cc`
- `bcc`
- `reply_to`
- `subject`
- `date_header`
- `received_at`
- `return_path`
- `headers_raw`
- `headers_normalized`
- `authentication_results_raw`
- `spf_result`
- `spf_domain`
- `dkim_result`
- `dkim_domains`
- `dmarc_result`
- `dmarc_disposition`
- `dmarc_policy`

Body and attachment metadata:

- `snippet`
- `body_text`
- `body_html`
- `attachments_meta`
- `mime_tree`
- `size_estimate`

State and organization:

- `is_read`
- `is_starred`
- `is_important`
- `is_spam`
- `is_trash`
- `labels_or_flags`
- `folder_or_mailbox`

Policy/model outputs:

- `content_class`
- `priority_state`
- `ownership_state`
- `policy_decision`
- `decision_reason`
- `model_confidence`
- `action_state`

AR feedback fields:

- `novelty`
- `trust`
- `impact`
- `intent`
- `signal_quality`
- `feedback_text`

### 17.6. Standards and schema references

Use these as authoritative semantics when mapping across providers.

- Message format and headers: RFC 5322
- MIME body model: RFC 2045-2049
- SMTP transport: RFC 5321
- POP3: RFC 1939
- IMAP4rev1 and IMAP4rev2: RFC 3501 / RFC 9051
- SMTP enhanced status codes: RFC 3463
- DNS concepts and records: RFC 1034 / RFC 1035
- MX behavior and "Null MX": RFC 5321 (Section 5) / RFC 7505
- Email auth headers/protocols used in practice:
  - DKIM: RFC 6376
  - SPF: RFC 7208
  - DMARC: RFC 7489
  - Authentication-Results: RFC 8601
- JSON Mail (schema-like API model alternative): JMAP (RFC 8620 family)
- Gmail API message/thread/label resources: provider-specific operational schema
- Schema.org email semantics:
  - `email` property (Text): `https://schema.org/email`
  - `EmailMessage` type: `https://schema.org/EmailMessage`

### 17.7. Schema.org email cross-reference (reviewed)

`schema.org/email` defines the generic `email` property with `Text` values.  
`schema.org/EmailMessage` adds message-centric fields useful for interchange metadata, not transport/auth enforcement.

| Canonical AR field                                               | Schema.org mapping                                                       | Notes/gaps                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| `from`                                                           | `sender` + nested `email`                                                | sender may be `Person`, `Organization`, or `Audience` |
| `to`                                                             | `toRecipient` + nested `email`                                           | can repeat for multiple recipients                    |
| `cc`                                                             | `ccRecipient` + nested `email`                                           | aligns to carbon-copy recipient set                   |
| `bcc`                                                            | `bccRecipient` + nested `email`                                          | often omitted in downstream copies for privacy        |
| `date_header` / sent-time                                        | `dateSent`                                                               | sent timestamp only                                   |
| `received_at`                                                    | `dateReceived`                                                           | defined for single-recipient context                  |
| `is_read`                                                        | `dateRead` present/non-null                                              | represents read event timestamp, not a boolean flag   |
| `attachments_meta`                                               | `messageAttachment`                                                      | attachment structure is coarse (`CreativeWork`)       |
| `body_text`                                                      | `text`                                                                   | no protocol-level MIME details                        |
| `subject`                                                        | no strict direct property; approximate with `about`/`name`/`description` | keep native header as source of truth                 |
| `message_id`, `thread_id`, `labels_or_flags`, auth result fields | no first-class equivalents                                               | retain provider/native schema fields                  |

### 17.8. Matching guidance

For future matching and migration:

1. store raw source fields unchanged,
2. map into canonical fields without dropping source aliases,
3. keep canonical + alias index for search and policy rules,
4. keep protocol-specific status fields even when normalized equivalents exist.

### 17.9. Terminology concordance matrix (standards, references, products, OSS)

Use this table to group same/similar terms by function and preserve cross-source equivalence.

| Function group                     | Same/similar terms                                                      | Standards and references usage                                                                                                                            | Product usage (reviewed set)                                              | OSS usage (reviewed set)                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Message identity and dedupe        | `Message-ID`, message id, provider message id, `UID`, `UIDL`, duplicate | RFC 5322 (`Message-ID`), RFC 9051 (IMAP `UID`), RFC 1939 (`UIDL`)                                                                                         | duplicate suppression is implicit in triage UX expectations               | `inbox-zero` action/audit semantics; `himalaya` IMAP identity; `gmailsorter` Gmail message ids    |
| Thread/conversation grouping       | thread, conversation, chain, `threadId`, references                     | RFC 5322 (`In-Reply-To`, `References`); Gmail API `threadId`; Schema.org `EmailMessage` context (no first-class thread id)                                | Shortwave split/pin thread workflow                                       | `inbox-zero` Gmail thread flows; `gmailLoader` fetch/classify on Gmail threads                    |
| Sender authorization (email auth)  | SPF, DKIM, DMARC, auth results, alignment, disposition                  | RFC 7208 (SPF), RFC 6376 (DKIM), RFC 7489 (DMARC), RFC 8601 (`Authentication-Results`)                                                                    | trust/safety signal input for priority and action gating                  | `email-oauth2-proxy` transport/auth connectivity boundary; header parsing in triage pipelines     |
| DNS and routing                    | DNS records, `MX`, exchanger, preference, `Null MX`, `TXT`              | RFC 1034/1035 (DNS), RFC 5321 Section 5 (MX lookup), RFC 7505 (`Null MX`)                                                                                 | mostly hidden behind provider UX, affects reliability/diagnostics         | `himalaya` and `email-oauth2-proxy` depend on SMTP/IMAP DNS resolution                            |
| Mailbox organization               | mailbox, folder, label, category, tag, system label                     | IMAP mailbox model (RFC 9051); Gmail labels (provider-specific); Schema.org has no label primitive                                                        | Fyxer actionable labels; Clean Email cleanup categories                   | `himalaya` folders/mailboxes; `clearmail` provider labels/folders; `gmailsorter` label operations |
| Priority and urgency               | priority, important, urgent, act-now, later, ignore, starred            | RFC headers (`Priority`, `Importance`, `X-Priority`) in 5322/MIME context; policy layer otherwise                                                         | SaneBox (`Later`, `NoReply`, digest-first); Fyxer/Cora priority shaping   | `gmailsorter` supervised label-learning for priority-like routing; `inbox-zero` rule taxonomy     |
| Action semantics                   | label, archive, prioritize, draft, send, forward, digest                | RFC 5321 (send), RFC 9051 mailbox updates; Gmail API drafts/messages/labels endpoints                                                                     | Fyxer/Cora drafting + structured outcomes; SaneBox archive/defer patterns | `himalaya` read/send roundtrip; `inbox-zero` action model; `clearmail` triage scripts             |
| Ownership and workflow state       | unassigned, assigned, waiting, done, SLA                                | no protocol RFC; application workflow vocabulary                                                                                                          | Hiver shared inbox assignment/SLA                                         | `inbox-zero` audit/workflow semantics; team-state fields in AR schema                             |
| Follow-up scheduling               | snooze, remind later, defer, follow-up                                  | no core mail RFC term; provider/UI workflow layer                                                                                                         | Gmail/Shortwave follow-up style UX patterns                               | queue/state layers in AR policy schema; extension-side patterns under evaluation                  |
| Ingestion/event pipeline           | watch, webhook, poll, idle, history cursor                              | Gmail API `users.watch`, `users.history.list`; IMAP `IDLE` in protocol model                                                                              | near-real-time triage expectation in modern assistants                    | `inbox-zero` watch/webhook model; OpenClaw `gog` + webhook path; IMAP polling fallback            |
| Body and attachment representation | MIME tree, body text/html, attachment metadata, content type            | RFC 2045-2049 (MIME), RFC 5322 headers; Schema.org `messageAttachment`, `text`                                                                            | user-facing summarization and preview                                     | `emailgenius` parsing pipeline, `himalaya` message rendering, `inbox-zero` processing             |
| Structured interchange fields      | sender, recipients, date sent/received/read, attachment                 | Schema.org `email` + `EmailMessage` (`sender`, `toRecipient`, `ccRecipient`, `bccRecipient`, `dateSent`, `dateReceived`, `dateRead`, `messageAttachment`) | interoperability and metadata export/import                               | normalization target for AR schema before policy/model stages                                     |
