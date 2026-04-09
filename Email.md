# OpenClaw Email Processing

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1. Email document map and inclusion rules](#11-email-document-map-and-inclusion-rules)
- [2. Methodology](#2-methodology)
  - [2.1. Research posture and attitude](#21-research-posture-and-attitude)
  - [2.2. Evidence and decision rules](#22-evidence-and-decision-rules)
  - [2.3. Scope boundaries for this phase](#23-scope-boundaries-for-this-phase)
- [3. Problem Statement](#3-problem-statement)
- [4. Goals and Success Criteria](#4-goals-and-success-criteria)
- [5. Solution Thesis, Benefits, and PMF](#5-solution-thesis-benefits-and-pmf)
- [6. Requirements and Design Constraints](#6-requirements-and-design-constraints)
- [7. Architecture and Design Direction](#7-architecture-and-design-direction)
  - [7.1. Decision-oriented findings](#71-decision-oriented-findings)
  - [7.2. Recommendations](#72-recommendations)
  - [7.3. Reading path for decision-makers](#73-reading-path-for-decision-makers)
- [8. Validation Status](#8-validation-status)
- [9. Implementation Options](#9-implementation-options)
  - [9.1. Option A: Gmail native pipeline](#91-option-a-gmail-native-pipeline)
  - [9.2. Option B: IMAP-first pipeline](#92-option-b-imap-first-pipeline)
  - [9.3. Option C: Hybrid](#93-option-c-hybrid)
  - [9.4. Controlled automation rollout](#94-controlled-automation-rollout)
  - [9.5. AR processing model for inbox accessibility](#95-ar-processing-model-for-inbox-accessibility)
  - [9.6. Native Gmail versus Maildir mirror](#96-native-gmail-versus-maildir-mirror)
- [10. Storage and Persistence Options](#10-storage-and-persistence-options)
  - [10.3.2. `notmuch` as a reference architecture](#1032-notmuch-as-a-reference-architecture)
  - [10.3.3. Pimalaya Maildir backend as reusable Rust substrate](#1033-pimalaya-maildir-backend-as-reusable-rust-substrate)
  - [10.3.4. Schema posture in reviewed projects](#1034-schema-posture-in-reviewed-projects)
  - [10.3.5. Canonical substrate summary](#1035-canonical-substrate-summary-pimalaya-himalaya-neverest-and-notmuch)
  - [10.3.6. Anti-spam technology and standards as feature inputs](#1036-anti-spam-technology-and-standards-as-feature-inputs)
  - [10.3.7. Definitive schema references](#1037-definitive-schema-references-inbox-zero-and-gmailsorter)
  - [10.4. Direct OpenClaw Maildir adapter](#104-direct-openclaw-maildir-adapter)
- [11. OSS Project Analysis](#11-oss-project-analysis)
- [12. Commercial Vendor Coverage](#12-commercial-vendor-coverage)
- [13. Recommended Near-term Plan for the Email Project](#13-recommended-near-term-plan-for-the-email-project)
- [14. OSS Maturity Snapshot](#14-oss-maturity-snapshot-collected)
- [15. Open Questions](#15-open-questions)
- [16. References](#16-references)
- [17. Appendix: Protocol Controls, States, Fields, and Schema Cross-reference](#17-appendix-protocol-controls-states-fields-and-schema-cross-reference)
  - [17.10. Work sequence for remaining questions and decisions](#1710-work-sequence-for-remaining-questions-and-decisions)
  - [17.11. Current working resolutions](#1711-current-working-resolutions)
  - [17.12. Source adapter contract and implementation suggestion](#1712-source-adapter-contract-and-implementation-suggestion)

## 1. Introduction

Email remains one of the highest-value but highest-friction information streams for operators, builders, and small teams running OpenClaw. The core difficulty is not raw ingestion. The difficulty is selective attention under constant change: too many updates, uneven source quality, conflicting urgency signals, and unclear trust boundaries for automation.

This document treats email handling as an accessibility and decision-quality problem first, and an integration problem second. The objective is to define a practical path from noisy inbound streams to reliable, explainable, policy-bounded actions.

### 1.1. Email document map and inclusion rules

`Email.md` is the central document for the email subject in this workspace.

The email-specific document set should stay compact:

- `Email.md`
  - central narrative, document map, problem framing, implementation direction, decision summaries, and the rules for where email material belongs.
- `EmailModel.md`
  - canonical technical reference for email entities, information elements, behaviors, relationships, and adaptation rules.
- `EmailMatrix.md`
  - comparison instrument for providers, protocols, libraries, tools, and reviewed products mapped against the canonical model.

Document-inclusion rule for this set:

- `Email.md` is the only place that should act as the email document map.
- `Email.md` should cross-reference `EmailModel.md` and `EmailMatrix.md` directly whenever a summary needs a canonical definition or a side-by-side comparison.
- `EmailModel.md` and `EmailMatrix.md` should stay mostly self-contained and should reference `Email.md` only when a direct pointer materially improves clarity.
- `Priorai.md` may reference `Email.md` sections occasionally because email is the first proving ground, but `Email.md` should remain readable on its own.
- Avoid duplicating long field catalogs, behavior lists, or mapping tables in multiple documents. Put the full version in one place, then point to it.

In practice, use this split:

- put broad framing, market/project context, implementation choices, and high-level conclusions in `Email.md`;
- put canonical naming, value semantics, entity relationships, and adaptation rules in `EmailModel.md`;
- put cross-provider and cross-tool comparisons in `EmailMatrix.md`.

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

Recommendation 5: Keep fetch, local mirror, and mailbox interaction roles explicit.
Do not treat Gmail-native hooks, Maildir mirror tools, and mailbox clients as substitutes for one another. Each solves a different part of the system.

Canonical follow-up:

- use `EmailModel.md` for the authoritative definitions of entities, fields, behaviors, and relationships;
- use `EmailMatrix.md` for side-by-side provider, library, tool, and product comparisons.

### 7.3. Reading path for decision-makers

If the objective is decision-making rather than implementation detail, read this document in this order:

1. sections 3-7 for problem framing and strategic direction,
2. section 14 for current market/integration readiness signals,
3. section 13 for execution and promotion gates,
4. sections 11-12 and 17 only for technical due diligence.

When the question shifts from "what should we do" to "what exactly does this field or behavior mean", use:

- `EmailModel.md` for canonical technical definitions;
- `EmailMatrix.md` for compatibility and mapping details.

## 8. Validation Status

This section captures current execution confidence, distinguishing verified behavior from inferred readiness. It is intentionally conservative: unresolved integration work is explicitly separated from observed facts.

### 8.1. Verified

- OpenClaw email docs are available and internally consistent for setup flow:
  - `docs/automation/gmail-pubsub.md`
  - `docs/automation/webhook.md`
  - `docs/hooks.md`
- `gog` source and docs were reviewed directly enough to verify the current Gmail watch payload and serving semantics:
  - top-level `historyId`
  - top-level `deletedMessageIds`
  - per-message `id`, `threadId`, `from`, `to`, `subject`, `date`, `snippet`, `body`, `bodyTruncated`, `labels`
  - supported history types: `messageAdded`, `messageDeleted`, `labelAdded`, `labelRemoved`
  - default excluded labels: `SPAM`, `TRASH`
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

Verified `gog` watch payload already carries more than the current OpenClaw summary mapping uses:

- top-level `historyId`
- top-level `deletedMessageIds`
- per-message `threadId`
- per-message `to`
- per-message `date`
- per-message `labels`
- per-message `bodyTruncated`

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

### 9.6. Native Gmail versus Maildir mirror

The architecture question is not which path is "better" in the abstract. The question is which path owns which function.

| Function    | Gmail native path (`gog` + Pub/Sub/hooks)                                                | Maildir mirror path                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Fetch       | Strong for low-latency event ingestion and provider-native metadata                      | Strong for durable local history and provider-independent replay once the mirror exists                                                    |
| Prioritize  | Stronger inside OpenClaw because watch events already arrive in agent/runtime context    | Depends on an OpenClaw Maildir adapter or external mailbox client to surface candidate messages                                            |
| Present     | Strong for OpenClaw-native summaries, templated delivery, and conversation-linked triage | Strong for local browsing and historical access, but weaker until normalized into OpenClaw events                                          |
| Disposition | Narrow by default; strongest for ingest, summarize, and gated follow-up actions          | Strong when paired with a mailbox client such as `himalaya`, weaker for direct OpenClaw-native actions unless a dedicated adapter is built |

OpenClaw conclusion:

- Gmail native path is the best first ingestion path when Gmail is primary and event latency matters.
- Maildir mirror is the best resilience and history layer when long local retention, provider independence, or replayability matter.
- The likely durable design is Gmail-native fetch for immediacy plus optional Maildir mirror for fallback, archive, and replay.
- The immediate OpenClaw improvement path is not a new connector. It is exposing more of the already-available `gog` Gmail surface before deeper adapter work begins.

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

### 10.3.1. Schema patterns observed in the reviewed OSS

The reviewed projects separate into three storage shapes:

- mailbox and sync tools (`himalaya`, `neverest`, `getmail6`, `isync` / `mbsync`, `hoardy-mail`, `cloud_mdir_sync`) mostly use provider state, Maildir, and small sync/config state rather than application databases;
- workflow systems (`inbox-zero`) keep provider mailboxes as content truth but add a relational sidecar for rules, actions, queues, digests, and audit trails;
- classification projects (`gmailsorter`) persist a smaller SQL-backed local model of messages, labels, participants, tokens, and ML artifacts.

Most useful reference points:

- `inbox-zero`: PostgreSQL + Redis + Prisma schema with explicit entities for accounts, labels, rules, actions, digests, cleanup, filing, and message/thread tracking;
- `gmailsorter`: SQLAlchemy schema with explicit message, thread, label, participant, OAuth token, and ML feature/model tables;
- `offlineimap3`: local sync-status SQLite cache rather than a broad app database;
- Maildir tools: strong file-store behavior, weak app-level schema guidance unless paired with a separate sidecar.

OpenClaw implication:
the sidecar store should not collapse message bodies, mailbox membership, provider metadata, sync cursors, and action history into one record. At minimum, keep distinct entities for account/provider identity, sync state, message identity, participants, mailbox membership, flags/status, provider-specific metadata, and action/audit history.

### 10.3.2. `notmuch` as a reference architecture

`notmuch` is easy to underestimate if treated as "just a local mail search tool". In implementation terms it is doing several harder things at once:

- incremental crawl:
  - `notmuch new` is not a naive rescan;
  - it tracks directory state and mtimes and updates incrementally as Maildir files change.
- logical message identity:
  - the system does not treat filenames as the message identity;
  - one logical message may correspond to multiple files or placements.
- thread construction:
  - threading is built from `Message-ID`, `In-Reply-To`, and `References`;
  - missing references are represented by ghost records so partial archives still form coherent threads.
- search/index separation:
  - raw messages remain in Maildir or MH;
  - searchable metadata, thread relations, tag state, and directory records live in a separate `Xapian` database.
- Maildir/local-state bridge:
  - Maildir filename flags can be synchronized into local tags;
  - local tags can be written back into Maildir flags when configured.
- exclusion semantics:
  - excluded tags such as `deleted` or `spam` are hidden by default but can be explicitly surfaced;
  - suppression is policy, not deletion.

OpenClaw implication:
`notmuch` is not the answer to the whole problem, but it is the strongest reference for three specific design choices:

- keep raw mail files separate from searchable local metadata,
- treat threading and identity as first-class local structures,
- implement soft suppression and exclusion as explicit policy state rather than destructive movement or deletion.

### 10.3.3. Pimalaya Maildir backend as reusable Rust substrate

The reusable Rust mailbox layer in the Pimalaya family is the shared `email-lib` Maildir backend, not `neverest` as a CLI and not `himalaya` as a user-facing mailbox client.

What the shared layer already provides:

- Maildir and Maildir++ handling;
- folder add/list/delete/expunge;
- envelope get/list;
- message add/peek/get/copy/move/remove;
- flag add/set/remove;
- integrity checks;
- watch support;
- local threading support;
- filter and sort query support over local messages.

Observed query support already includes:

- filters:
  - `date`
  - `before`
  - `after`
  - `from`
  - `to`
  - `subject`
  - `body`
  - `flag`
- boolean composition:
  - `and`
  - `or`
  - `not`
- sort keys:
  - `date`
  - `from`
  - `to`
  - `subject`

What it does not provide:

- a persistent local full-text index;
- a durable sidecar database for policy, audit, ranking, or explanation state;
- a `notmuch`-level thread/index model with ghost-message handling and persistent thread metadata.

OpenClaw implication:
if the project wants a Rust-first Maildir substrate, Pimalaya is already a strong mailbox layer. The missing work is not "how do we read Maildir". The missing work is:

- sidecar schema,
- replayable prioritization and blocking state,
- durable custom attributes,
- indexed search when file-by-file scans stop being acceptable.

### 10.3.4. Schema posture in reviewed projects

The useful comparison here is not ORM choice. It is schema posture.

- `inbox-zero` shows a broad, explicit, migration-heavy application schema:
  - accounts,
  - provider state,
  - labels and taxonomy,
  - rules and executed actions,
  - digests,
  - filing,
  - messaging side channels,
  - organization and collaboration state.
- `gmailsorter` shows a smaller, local, still-queryable sidecar:
  - messages,
  - threads,
  - labels,
  - participants,
  - OAuth token state,
  - ML features and model artifacts.

OpenClaw implication:

- do not optimize around an ORM choice this early;
- choose the schema posture once and keep it stable;
- borrow the broad entity set from `inbox-zero` and the compact sidecar discipline from `gmailsorter`;
- keep provider mailbox state, derived local classification state, and audit/action history as explicit layers even if they end up sharing one physical database.

### 10.3.5. Canonical substrate summary: Pimalaya, Himalaya, Neverest, and `notmuch`

This is the canonical short substrate summary for the rest of the document set.

`Pimalaya email-lib`

- reusable Rust mailbox substrate;
- owns Maildir, IMAP, SMTP, query, sort, watch, threading, and mailbox mutation capabilities;
- strongest fit when the question is:
  - how do we read, update, and watch mailboxes with a reusable Rust layer?

`Himalaya`

- user-facing mailbox client on top of the shared Pimalaya stack;
- strongest fit when the question is:
  - how do we expose mailbox interaction through a process boundary quickly?
- useful for:
  - listing,
  - filtering,
  - sorting,
  - reading,
  - moving,
  - flagging,
  - drafting and sending.

`Neverest`

- sync and mirroring tool on top of the same family of crates;
- strongest fit when the question is:
  - how do we fetch from IMAP or Gmail-adjacent account paths into a durable local mirror such as Maildir?
- useful for:
  - date-scoped backfill,
  - folder-scoped sync,
  - local mirror and replay setup.

`notmuch`

- not a fetcher and not a general mailbox library;
- strongest fit when the question is:
  - how should local identity, threading, indexing, flag-tag synchronization, and exclusion semantics work above a Maildir store?

OpenClaw implication:

- the Pimalaya family is the strongest reusable Rust mailbox substrate;
- `Himalaya` is the most credible early interaction boundary;
- `Neverest` is the most credible early Maildir-ingest and mirror candidate;
- `notmuch` remains the best reference for the local index and suppression layer that still has to be designed.

This is the canonical email-substrate summary for the project.
- Neither changes the core split this document is arguing for:
  - raw message permanence,
  - searchable local metadata,
  - policy/action/audit state
    should remain distinct layers even if they happen to share one physical database later.

### 10.3.6. Anti-spam technology and standards as feature inputs

Modern spam filtering engines are evaluating several different classes of evidence at once. That matters for OpenClaw because blocking and prioritization should not be designed as one undifferentiated classifier.

The recurring signal families across mature OSS systems are:

- authentication and provenance:
  - SPF, DKIM, DMARC, ARC, `Authentication-Results`, `Received`, HELO/EHLO, PTR/rDNS, envelope sender, and domain alignment;
- reputation:
  - sender IP/domain reputation, URI reputation, historical complaint rates, rate limits, and blocklist membership;
- MIME and structural integrity:
  - malformed headers, missing `Date` / `From` / `Message-ID`, broken MIME trees, HTML-only content, suspicious encodings, image-heavy messages, odd attachment types;
- lexical and statistical content:
  - subject/body terms, token frequencies, Bayesian or ML features, language and formatting anomalies;
- workflow and list headers:
  - `List-Id`, `List-Unsubscribe`, one-click unsubscribe support, `Auto-Submitted`, `Precedence`, and other bulk/list conventions;
- link and attachment inspection:
  - domain mismatches, shorteners, visible-text versus href mismatches, archive/encrypted attachment patterns, malware/phish indicators.

The strongest OSS references divide roughly like this:

- `SpamAssassin`:
  - expression language over `header`, `body`, `rawbody`, `uri`, `full`, `meta`, and `eval` tests;
  - best reference for "how many normalized message surfaces should be exposed to rules";
- `Rspamd`:
  - score/symbol architecture with explicit actions such as accept, add header, greylist, and reject;
  - strong reference for combining auth checks, reputation, composite expressions, and programmable extensions;
- `bogofilter` and older statistical filters:
  - useful reminders that spam and preference judgments often benefit from feedback loops, but too narrow to serve as the whole product model.

Relevant standards and conventions:

- `RFC 5322`: core message format and headers.
- `RFC 7208`: SPF.
- `RFC 6376`: DKIM.
- `RFC 7489`: DMARC.
- `RFC 8601`: `Authentication-Results`.
- `RFC 8617`: ARC.
- `RFC 2369`: `List-*` headers.
- `RFC 8058`: one-click unsubscribe.
- `RFC 3834`: `Auto-Submitted`.
- `RFC 5228` and `RFC 5235`: Sieve and its `spamtest` / `virustest` extensions.

Gmail-specific implication:

- Gmail already does substantial provider-side spam and bulk classification;
- Gmail sender guidance now explicitly expects SPF or DKIM, DMARC for large senders, TLS, valid PTR/rDNS, RFC 5322 formatting, one-click unsubscribe for bulk senders, and low complaint rates;
- Gmail category and system labels should therefore be treated as important features, but not as the only truth for OpenClaw.

OpenClaw implication:

- blocking should be conservative and rely on high-confidence suppression signals:
  - explicit spam/junk placement,
  - strong authentication failure patterns,
  - clear phishing or malware indicators,
  - extremely poor reputation when available;
- prioritization should remain a broader policy layer:
  - sender familiarity,
  - explicit asks and thread state,
  - Gmail categories and labels,
  - list/bulk headers,
  - local user feedback,
  - learned relevance models;
- "bulk but wanted", "bulk but ignorable", and "true spam" should remain separate classes.

### 10.3.7. Definitive schema references: `inbox-zero` and `gmailsorter`

Two schema references matter more than the others because they show opposite ends of the sidecar-design spectrum.

`inbox-zero`:

- database/configuration path observed in repo and docs:
  - local development:
    - `docker compose -f docker-compose.dev.yml up -d`
    - `cd apps/web && pnpm prisma migrate dev && cd ../..`
  - container/runtime:
    - `npx prisma generate --schema=apps/web/prisma/schema.prisma`
    - `prisma migrate deploy --config=/app/docker/scripts/prisma.config.ts --schema=./apps/web/prisma/schema.prisma`
  - datastore shape:
    - PostgreSQL via Prisma;
    - Redis / Upstash for queue and workflow state.
- schema shape:
  - identity/auth:
    - `User`, `Account`, `Session`, `EmailAccount`, `ApiKey`;
  - provider watch and sync state:
    - Gmail/Outlook watch subscription fields and history ids on `EmailAccount`;
  - taxonomy:
    - `Label`, `Category`, `Group`, `GroupItem`, `Newsletter`, deprecated `ColdEmail`;
  - policy/action model:
    - `Rule`, `Action`, `RuleHistory`, `ExecutedRule`, `ExecutedAction`, `ScheduledAction`;
  - message and thread tracking:
    - `EmailMessage`, `ThreadTracker`, `ResponseTime`;
  - digest/cleanup:
    - `Digest`, `DigestItem`, `CleanupJob`, `CleanupThread`;
  - adjacent integrations:
    - messaging, calendar, drive, filing, MCP connections and tools.
- important enum vocabularies:
  - `ActionType` includes `ARCHIVE`, `LABEL`, `REPLY`, `SEND_EMAIL`, `FORWARD`, `DRAFT_EMAIL`, `MARK_SPAM`, `CALL_WEBHOOK`, `MARK_READ`, `DIGEST`, `MOVE_FOLDER`, `NOTIFY_SENDER`;
  - `SystemType` includes `TO_REPLY`, `FYI`, `AWAITING_REPLY`, `ACTIONED`, `COLD_EMAIL`, `NEWSLETTER`, `MARKETING`, `CALENDAR`, `RECEIPT`, `NOTIFICATION`.

`gmailsorter`:

- creation/configuration path observed in docs and code:
  - environment:
    - `MAILSORT_ENV_CREDENTIALS_FILE=/path/to/credentials.json`
    - `MAILSORT_ENV_DATABASE_URL=sqlite:////path/to/email.db`
    - `MAILSORT_ENV_SECRET_KEY=...`
  - web app:
    - `python -m gmailsorter.webapp`
  - manual worker operations:
    - `gmailsorter-daemon -s -c ${MAILSORT_ENV_CREDENTIALS_FILE} -d ${MAILSORT_ENV_DATABASE_URL}`
    - `gmailsorter-daemon -u -c ${MAILSORT_ENV_CREDENTIALS_FILE} -d ${MAILSORT_ENV_DATABASE_URL}`
  - datastore shape:
    - SQLAlchemy, default SQLite, with `Base.metadata.create_all(engine)` used to create tables.
- schema shape:
  - message tables:
    - `email_content`, `email_threads`, `email_labels`, `email_from`, `email_to`, `email_cc`;
  - auth/app state:
    - `google_token`, `google_user`, `google_task`;
  - ML state:
    - `ml_labels`, `ml_features`.

OpenClaw implication:

- `inbox-zero` is the best schema reference for a mature application sidecar that keeps policy, audit, and workflow state explicit;
- `gmailsorter` is the best schema reference for an early local classifier sidecar with compact SQL-backed persistence;
- both reinforce the same conclusion:
  - Maildir or provider mailboxes can remain the message substrate,
  - but a sidecar database will still be needed for classification, blocking, prioritization, and action history.

### 10.4. Direct OpenClaw Maildir adapter

OpenClaw can plausibly operate on Maildir directly, but only through a mail-aware adapter. Maildir is not merely a folder of arbitrary text files. It carries mailbox semantics through MIME content, folder layout, and filename flags.

A direct adapter would need to:

1. watch `new`, `cur`, and `tmp`,
2. parse MIME bodies, headers, and attachments,
3. normalize account, folder, message, and thread identity into OpenClaw event records,
4. preserve dedupe and state-transition logic,
5. separate local mailbox state from OpenClaw policy and action history.

Adapter conclusion:
if Maildir becomes first-class in OpenClaw, it should be implemented as a mailbox substrate with a typed adapter boundary, not as generic file scraping.

## 11. OSS Project Analysis

The OSS review is focused on operational reuse, not feature sightseeing. The test is whether each component helps solve the core failure mode described earlier: low-attention review cadence (sometimes daily, sometimes weekly), high-noise inboxes, and missed critical service or personal messages. This section preserves implementation detail while folding it back into decision pressure: multi-account handling, auth reliability, storage posture, and explainable triage.

Detailed project catalog and local clone inventory are maintained in `../Emails/Emails.md`. This section keeps only the OSS detail that changes OpenClaw design choices.

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
  - strength: explicit Gmail and Outlook examples, OAuth2/keyring patterns, and a cleaner fit than a generic mail client when local mirror semantics are the goal;
  - limitation: Rust process boundary and sync-state operational overhead.
- Python stdlib `mailbox.Maildir`:
  - role: local read/write API;
  - strength: no external dependency, canonical Maildir primitive;
  - limitation: no network auth/sync/triage orchestration.
- `getmail6`:
  - role: POP3/IMAP retrieval and delivery to local stores;
  - strength: mature ingress/delivery focus with explicit Gmail and Office 365 paths;
  - limitation: not a full mailbox operations platform and weak as a durable Gmail metadata carrier.
- `offlineimap3`:
  - role: IMAP <-> Maildir synchronization;
  - strength: bidirectional mirror semantics and the strongest Gmail label/metadata preservation in this set;
  - limitation: operational sync complexity; weak alignment with explainable action-policy layers.
- `isync` / `mbsync`:
  - role: lightweight IMAP <-> Maildir synchronization;
  - strength: simpler Maildir-first workflow and smaller operational surface than the larger sync stacks;
  - limitation: fewer Gmail-specific setup aids, no clear first-party Yahoo/Outlook positioning, and less explicit policy/audit framing than the sidecar-oriented candidates.
- `hoardy-mail`:
  - role: IMAP -> Maildir or MDA fetch with safe batch maintenance operations;
  - strength: explicit Gmail, Yahoo, Hotmail, and Yandex recipes plus careful fetch/delete and expire flows;
  - limitation: GPL-3.0, small project footprint, and weaker metadata fidelity than the richer sync stacks.
- `cloud_mdir_sync`:
  - role: cloud API <-> Maildir synchronization;
  - strength: Gmail API and Office365 Graph -> Maildir synchronization, plus local Maildir monitoring and upload-back;
  - limitation: narrower provider scope, GPL-family license, and smaller ecosystem.

Comparison to `pimalaya/himalaya`:

- `pimalaya/himalaya` provides a broad read/manage/send CLI with IMAP/SMTP/Sendmail and optional OAuth2/keyring.
- `pimalaya/neverest` is the clearest Pimalaya-side fit for Gmail -> Maildir fetch when the goal is a durable local mirror rather than human mailbox interaction.
- `mailbox.Maildir` is local-only and useful as a primitive helper rather than a transport.
- `getmail6` is the mature ingress reference when simple Gmail/Office 365 fetch into local delivery matters more than mirror fidelity.
- `offlineimap3` is the strongest Gmail-specific sync reference when label and mailbox fidelity matter more than operational simplicity.
- `isync` / `mbsync` is the lightweight Maildir-first sync reference when the goal is a simple local mirror rather than richer account onboarding.
- `hoardy-mail` is the strongest explicit Yahoo -> Maildir reference in this set.
- `cloud_mdir_sync` is the API-native Gmail/Office365 mirror reference when cloud APIs are preferable to IMAP.

Practical sequence:

1. Validate Himalaya process boundary + error normalization contract.
2. Validate `neverest` as the first Gmail -> Maildir mirror candidate when durable local history is required.
3. Prototype `getmail6` as the simpler ingress sidecar into the same normalized schema.
4. Keep `isync` / `mbsync` as the lightweight Maildir-first alternative for simpler mirror workflows.
5. Keep `hoardy-mail` as the explicit Yahoo path and safety-oriented fetch/delete reference.
6. Add `offlineimap3` where Gmail label and mailbox fidelity justify the heavier sync model.
7. Use stdlib `mailbox.Maildir` for glue code/tests, not primary transport.
8. Evaluate `cloud_mdir_sync` when API-native Gmail or Office365 sync is preferable to IMAP.

#### 11.2.5. Recommended Gmail -> Maildir shortlist

This shortlist separates fetch/mirror tools from mailbox interaction tools so the roles stay explicit.

| Candidate           | Primary role                  | Fetch into Maildir                                                              | Display/manage from Maildir                            | OpenClaw fit                                                        |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| `pimalaya/neverest` | sync, backup, restore         | strongest current fit for Gmail -> Maildir mirror with structured account setup | limited; not the main purpose                          | first-choice mirror candidate when durable local history matters    |
| `getmail6`          | retrieval and delivery        | simplest focused ingress path; Gmail and Office 365 documented                  | none beyond local delivery                             | first-choice simple ingress sidecar                                 |
| `hoardy-mail`       | ingress plus safe maintenance | explicit Gmail/Yahoo/Hotmail -> Maildir or MDA fetch                            | none beyond delivery and batch mailbox operations      | first-choice explicit Yahoo path and delete/expire design reference |
| `isync` / `mbsync`  | lightweight sync              | strong lightweight IMAP -> Maildir mirror                                       | none beyond mailbox sync                               | best lightweight mirror baseline                                    |
| `offlineimap3`      | fuller sync semantics         | strong but heavier operationally; strongest Gmail label fidelity                | none beyond mailbox sync                               | use where Gmail metadata fidelity justifies the complexity          |
| `cloud_mdir_sync`   | cloud API mirror              | API-native Gmail/Office365 -> Maildir sync                                      | none beyond sync and upload-back                       | use where API-native cloud sync is preferable to IMAP               |
| `pimalaya/himalaya` | mailbox client                | secondary; not the main fit                                                     | strongest human/operator read/manage layer in this set | best Maildir interaction layer, not primary Gmail fetch layer       |

Shortlist conclusion:

- choose `neverest` when durable Gmail-aware mirroring is the goal,
- choose `getmail6` when the goal is the simplest Gmail/Office 365 ingress path,
- choose `hoardy-mail` when Yahoo compatibility or safe fetch/delete workflows matter,
- choose `isync` / `mbsync` when you want the lightest Maildir-first sync,
- keep `offlineimap3` as the heavier but most Gmail-faithful mirror option,
- choose `cloud_mdir_sync` when API-native Gmail or Office365 sync is preferable to IMAP,
- use `himalaya` for reading and disposition on top of Maildir, not as the primary Gmail fetch tool.

Practical provider and Gmail-semantics split:

| Candidate          | Gmail flags/status                              | Gmail metadata             | Gmail mailbox and directory mapping                           | Outlook documented        | Yahoo documented |
| ------------------ | ----------------------------------------------- | -------------------------- | ------------------------------------------------------------- | ------------------------- | ---------------- |
| `neverest`         | generic IMAP/Maildir state; adequate            | limited explicit evidence  | adequate for mirror structure, not a Gmail-semantic reference | yes                       | no               |
| `getmail6`         | adequate for fetch/delivery flows               | weak as durable carry-over | limited; ingress-focused more than mailbox fidelity           | yes                       | no               |
| `hoardy-mail`      | adequate for fetch and batch mailbox operations | limited explicit evidence  | explicit provider recipes and Maildir/MDA delivery            | Hotmail documented        | yes              |
| `isync` / `mbsync` | good basic flags                                | weak                       | good simple mailbox mapping                                   | not explicitly documented | no               |
| `offlineimap3`     | strong                                          | strongest in this set      | strongest in this set                                         | partial / mixed evidence  | no               |
| `cloud_mdir_sync`  | moderate                                        | moderate                   | moderate; API-native cloud mapping                            | yes                       | no               |
| `himalaya`         | strong as a client once the store exists        | not the main point         | strong local mailbox interaction                              | yes                       | no               |

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

Source basis: collected review in `../Emails/Emails.md`. Pricing and tiers can change. The goal here is to extract stable operating semantics that improve real inbox outcomes, not to mirror marketing pages or chase feature parity. This section keeps only vendor-derived patterns that materially change OpenClaw design choices.

### 12.1. Directly relevant vendors

#### 12.1.0. MailChannels, AgentMail, and LobsterMail

These products matter because they target a newer design space than the traditional inbox tools in the OSS set: email infrastructure for agents rather than email for humans. They should not be treated as substitutes for a durable OpenClaw email architecture, but they are useful for pressure-testing the current Gmail Pub/Sub path and the boundary between provider infrastructure and OpenClaw-owned policy/state.

- `MailChannels` is commercial outbound email infrastructure. The relevant fit is sending, delivery reputation, tracking, and API-first outbound operations. It is not a general mailbox product and does not replace a fetch, archive, or Maildir path. Public docs and support material position it as the send/delivery half of an OpenClaw automation stack rather than a full inbox solution.
- `AgentMail` is commercial as a service, but its SDKs are documented as open source under MIT. Its fit is programmable agent inboxes with send/receive, thread handling, drafts, attachments, idempotent create flows, WebSocket notifications, and webhooks. This is closer to an agent-native email platform than to a traditional mailbox client.
- `LobsterMail` is commercial agent-email infrastructure. Current public positioning emphasizes zero-config agent signup, webhook or poll delivery, built-in agent security, and a simpler alternative to Google Workspace + Pub/Sub + webhook setup. I did not find a main public OSS repo for the product itself.

OpenClaw conclusion:

- `MailChannels` is useful when outbound deliverability is the problem.
- `AgentMail` and `LobsterMail` are useful when the problem is giving an agent a mailbox quickly without inheriting Gmail OAuth, Pub/Sub, and human-account overhead.
- none of the three replace the need for a clear OpenClaw-side model for prioritization, presentation, policy, audit, and optional local history.

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

### 12.3. What the agent-email providers imply for OpenClaw

The public provider offerings sharpen the architectural split already visible in the OSS review.

- OpenClaw's current Gmail-native path is still best understood as event ingestion plus hook-time summarization and wakeups.
- `AgentMail` and `LobsterMail` show there is market demand for a simpler agent-inbox path: provision inbox, receive via webhook or socket, send programmatically, keep the personal mailbox out of scope.
- `MailChannels` shows the outbound side can be separated cleanly from inbound mailbox ownership.

Design implication:

- if OpenClaw keeps Gmail Pub/Sub as its first-party email path, it should treat agent-email providers as alternative fetch and send backends rather than as a reason to weaken its own policy and sidecar model;
- if OpenClaw adds a more native email subsystem later, the useful imports from these providers are provisioning speed, thread-safe programmatic send/receive, and clean real-time notifications, not their product boundaries or hosting assumptions.

Seventh Sense focuses on outbound send-time optimization in marketing systems. It is adjacent, not a primary benchmark for inbound personal triage. Pricing posture in the collected pass was calculator-driven rather than fixed tiers.

### 12.3. Terminology and control taxonomy to standardize

To make policy, UI labels, and model prompts interoperable, OpenClaw should standardize these terms across config and runtime explanations. The criteria are:

- use clear terms before fashionable product language;
- keep state separate from action;
- keep mailbox placement separate from content classification;
- keep provider and product aliases available for matching/search, but not as canonical schema names;
- prefer terms that support explanation, reversal, and audit.

Observed drift in reviewed products and projects:

- Gmail labels mix mailbox membership, topic grouping, and some workflow hints.
- Outlook categories are metadata tags, not folders.
- SaneBox terms such as `Later` and `NoReply` describe placement or workflow buckets, not content classes.
- Fyxer and Cora "actionable" language blends priority state with action outcome.
- `gmailsorter` uses labels as learned target vocabulary rather than stable canonical schema.
- `inbox-zero` is the strongest OSS reference for keeping taxonomy, rules, and actions distinct.

Canonical groups to preserve in OpenClaw:

- content class: `receipt`, `newsletter`, `notification`, `outreach`, `personal`, `support`;
- mailbox membership: `inbox`, `archive`, `spam`, `trash`, `sent`, provider/system labels;
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
- hoardy-mail repo: `https://github.com/Own-Data-Privateer/hoardy-mail`

## 17. Appendix: Protocol Controls, States, Fields, and Schema Cross-reference

This appendix remains the compact support layer inside `Email.md`.

For complete canonical definitions and full comparison coverage, use:

- `EmailModel.md`
- `EmailMatrix.md`

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
| Maildir and local mirror substrate | Maildir, local mirror, cache, store, `cur/new/tmp`, sync state          | Maildir format references and local mailbox tooling; no single RFC term for application-side mirror metadata                                              | usually hidden behind product UX                                          | `neverest`, `getmail6`, `offlineimap3`, `isync`, `hoardy-mail`, `cloud_mdir_sync`                 |
| Priority and urgency               | priority, important, urgent, act-now, later, ignore, starred            | RFC headers (`Priority`, `Importance`, `X-Priority`) in 5322/MIME context; policy layer otherwise                                                         | SaneBox (`Later`, `NoReply`, digest-first); Fyxer/Cora priority shaping   | `gmailsorter` supervised label-learning for priority-like routing; `inbox-zero` rule taxonomy     |
| Action semantics                   | label, archive, prioritize, draft, send, forward, digest                | RFC 5321 (send), RFC 9051 mailbox updates; Gmail API drafts/messages/labels endpoints                                                                     | Fyxer/Cora drafting + structured outcomes; SaneBox archive/defer patterns | `himalaya` read/send roundtrip; `inbox-zero` action model; `clearmail` triage scripts             |
| Ownership and workflow state       | unassigned, assigned, waiting, done, SLA                                | no protocol RFC; application workflow vocabulary                                                                                                          | Hiver shared inbox assignment/SLA                                         | `inbox-zero` audit/workflow semantics; team-state fields in AR schema                             |
| Follow-up scheduling               | snooze, remind later, defer, follow-up                                  | no core mail RFC term; provider/UI workflow layer                                                                                                         | Gmail/Shortwave follow-up style UX patterns                               | queue/state layers in AR policy schema; extension-side patterns under evaluation                  |
| Ingestion/event pipeline           | watch, webhook, poll, idle, history cursor                              | Gmail API `users.watch`, `users.history.list`; IMAP `IDLE` in protocol model                                                                              | near-real-time triage expectation in modern assistants                    | `inbox-zero` watch/webhook model; OpenClaw `gog` + webhook path; IMAP polling fallback            |
| Body and attachment representation | MIME tree, body text/html, attachment metadata, content type            | RFC 2045-2049 (MIME), RFC 5322 headers; Schema.org `messageAttachment`, `text`                                                                            | user-facing summarization and preview                                     | `emailgenius` parsing pipeline, `himalaya` message rendering, `inbox-zero` processing             |
| Structured interchange fields      | sender, recipients, date sent/received/read, attachment                 | Schema.org `email` + `EmailMessage` (`sender`, `toRecipient`, `ccRecipient`, `bccRecipient`, `dateSent`, `dateReceived`, `dateRead`, `messageAttachment`) | interoperability and metadata export/import                               | normalization target for AR schema before policy/model stages                                     |

### 17.10. Work sequence for remaining questions and decisions

The remaining work should proceed in a strict sequence. The order matters because later decisions depend on earlier terminology, mapping, and validation work.

#### 17.10.1. Step 1: Freeze the canonical email model

Objective:

- establish the canonical entities, fields, behaviors, and relationships before adding more product-specific schemas or implementation details.

Primary sources:

- RFC and protocol semantics;
- Gmail provider semantics;
- Maildir storage semantics;
- canonical model work captured in `EmailModel.md`.

Deliverables:

- complete canonical information-element list;
- complete canonical behavior list;
- complete entity-relationship list;
- explicit distinction between:
  - provider-native fields,
  - mailbox-native abstractions,
  - product-owned state.

Acceptance criteria:

- every term used later in `Email.md`, `EmailMatrix.md`, and the implementation notes can be mapped to a canonical definition;
- no canonical field depends on a single product schema for its meaning;
- identity, conversation, placement, state, provenance, sync, ownership, feedback, and scoring are all covered.

Stop conditions:

- if a new field is proposed but cannot be defined independently of one provider or one product, do not add it yet;
- if two fields appear redundant, preserve both until the semantic difference is explicitly resolved.

#### 17.10.2. Step 2: Build the protocol and provider concordance

Objective:

- map standards and provider-native semantics onto the canonical model without flattening meaningful differences.

Sources to compare first:

- RFC 5322 / MIME
- SMTP
- POP3
- IMAP
- Maildir
- Gmail API
- `gog`

Deliverables:

- canonical-to-protocol/provider concordance table;
- notes on value shapes, ranges, and cardinality;
- notes on behavior differences such as:
  - `Date` vs `internalDate`
  - provider history vs snapshot semantics
  - labels vs folders
  - provider thread ids vs RFC threading.

Acceptance criteria:

- each canonical field has a protocol/provider mapping note where applicable;
- all lossy mappings are marked explicitly;
- provider-only fields that must be preserved are called out.

#### 17.10.3. Step 3: Map Pimalaya, Himalaya, Neverest, and OpenClaw current usage

Objective:

- determine what the current mailbox and runtime surfaces already expose, what they imply behaviorally, and what they omit.

Sources:

- Pimalaya shared library capabilities;
- Himalaya CLI naming and behavior;
- Neverest sync naming and behavior;
- OpenClaw Gmail hook path and `gog` integration.

Deliverables:

- canonical-to-Pimalaya/Himalaya/Neverest concordance;
- canonical-to-OpenClaw current Gmail-hook concordance;
- explicit mismatch list for:
  - naming
  - value types
  - relationship decomposition
  - behavioral assumptions.

Acceptance criteria:

- any silent assumptions in OpenClaw about `gog` payload shape are documented;
- any gaps between mailbox-native semantics and OpenClaw summary-level semantics are documented;
- field loss between Gmail/`gog` and OpenClaw current usage is explicit.

Decision questions to answer here:

- which canonical fields are already available with no new code;
- which canonical fields require richer message fetch than current hook summaries provide;
- which behaviors are already enforced by Pimalaya/Himalaya and should be adopted rather than reinvented.

#### 17.10.4. Step 4: Specify the adaptation strategy

Objective:

- define how source-native records become canonical records and how canonical records become product-usable records.

Deliverables:

- source-adapter rules for:
  - Gmail / `gog`
  - Maildir-backed local mirrors
  - IMAP mailbox access
- normalization rules for:
  - identity
  - conversation
  - mailbox membership
  - message state
  - provenance/auth
  - sync and replay
- preservation rules describing which source fields must remain stored unmodified.

Acceptance criteria:

- the adaptation path is explicit for each important mismatch;
- product-owned state is never used to overwrite source truth;
- replay and reprocessing remain possible from stored source facts.

#### 17.10.5. Step 5: Validate one Gmail-native path and one mailbox-native path

Objective:

- prove that the canonical model and adaptation rules survive real execution on both the provider-native and mailbox-native sides.

Validation targets:

- Gmail-native:
  - `gog`
  - Gmail watch/history/message fetch path
  - OpenClaw Gmail hook processing
- mailbox-native:
  - Himalaya
  - Neverest / Maildir mirror where applicable

Deliverables:

- verified field inventory actually obtainable in this workspace;
- verified behavior inventory actually observable in this workspace;
- list of missing fields, ambiguous fields, and unexpectedly shaped values;
- notes on local operational friction and failure modes.

Acceptance criteria:

- first successful mailbox operations and field extraction are documented;
- the canonical model does not require silent reinterpretation to fit the observed data;
- at least one Gmail-native and one mailbox-native path can populate the core canonical domains.

#### 17.10.6. Step 6: Correlate reviewed product schemas and implementations

Objective:

- bring in `inbox-zero`, `gmailsorter`, and later Hermes only after the canonical and mailbox/provider bases are stable.

Deliverables:

- canonical-to-`inbox-zero` notes;
- canonical-to-`gmailsorter` notes;
- later canonical-to-Hermes notes;
- list of extra product-specific elements that are:
  - useful,
  - unnecessary,
  - too opinionated for the canonical model.

Acceptance criteria:

- no reviewed product becomes the accidental source of truth for canonical naming;
- reused entities are justified by behavior and relationship fit, not by familiarity alone;
- implementation-specific artifacts such as ORM-driven partitions or ML storage tricks remain marked as local choices, not canonical requirements.

#### 17.10.7. Step 7: Define the first implementation boundary

Objective:

- decide what gets built first and where the handoff between fetch, normalization, and prioritization lives.

Decision surface:

- Gmail-native only vs hybrid vs Maildir-first;
- provider-history replay vs Maildir replay vs both;
- minimum canonical fields required for first scoring and display pass;
- minimum feedback fields required for evaluation.

Deliverables:

- first implementation boundary definition;
- first minimal persisted record shape;
- first replay/evaluation input shape;
- deferred-field list with rationale.

Acceptance criteria:

- the first implementation can be built without renaming the canonical model later;
- no deferred field is silently assumed by scoring or action logic;
- the chosen first path preserves future convergence with the wider canonical model.

#### 17.10.8. General execution rules

Apply these rules throughout the sequence:

1. Prefer actual code and observed runtime behavior over week-old notes or product copy.
2. Preserve behavior and relationships even when names drift.
3. Treat provider-native ids, threading, placement, and history as distinct until proven safely mergeable.
4. Keep ownership and access separate from grouping or categorization.
5. When in doubt, preserve more source truth and derive later.
6. Record all lossy mappings explicitly.
7. Separate:
   - source truth,
   - normalized canonical state,
   - product-owned feedback and scoring state.

### 17.11. Current working resolutions

The following decisions are treated as the current working baseline unless later evidence forces revision.

#### 17.11.1. Canonical semantics source

Standards and prevalent mailbox/provider behavior are the semantic base.

- RFC 5322, MIME, SMTP, POP3, IMAP, and Maildir behavior define the canonical meaning of message identity, parts, state, and mailbox placement.
- Provider-native semantics such as Gmail `threadId`, `labelIds`, `historyId`, and `internalDate` remain first-class provider projections and must not be flattened away.
- Naming drift is acceptable if behavior and entity relationships are preserved.

#### 17.11.2. Replay path priority

Replay starts from Maildir first.

Rationale:

- Maildir provides a durable local mirror and a stable replay substrate;
- Maildir replay avoids over-coupling the first evaluation loop to Gmail-only history semantics;
- provider history remains important and should still be preserved where available for incremental update handling and diagnostics.

Implication:

- provider change feeds remain part of the source-sync model;
- first replay and reprocessing validation should be designed around the Maildir mirror.

#### 17.11.3. Prioritization baseline

The first prioritization pass should strongly promote:

- unread messages;
- starred or otherwise strongly flagged messages.

This is a baseline heuristic, not the whole scoring model.

Implication:

- `is_read` and `is_flagged` are mandatory first-pass canonical fields;
- read and star actions must be captured from the start.

#### 17.11.4. Action scope from day one

The following actions must be first-class from the start:

- read
- star
- draft
- spam

They should be modeled as:

- mailbox/provider actions where applicable;
- explicit action-history events in the sidecar;
- inputs into ranking and policy evaluation.

#### 17.11.5. Ownership scope

Ownership and access semantics remain important, but detailed multi-principal ownership modeling is postponed.

Current implication:

- keep canonical ownership and access fields in the model;
- defer more complex team/shared-mailbox policy design until the single-principal flow is validated.

#### 17.11.6. Threading priority

Threading is explicitly deprioritized in the first implementation pass.

Rationale:

- thread semantics are valuable but can distract from the higher-value questions of fetch, state preservation, replay, and prioritization quality;
- provider thread ids and RFC threading should still be preserved so deeper thread-aware behavior can be added later without schema churn.

Current implication:

- preserve `provider_thread_id`, `conversation_id`, `in_reply_to_message_id`, and `references_message_ids`;
- do not make rich thread logic a blocker for first validation.

#### 17.11.7. OpenClaw and `gog` posture

`OpenClaw` will continue changing, so implementation questions should be phrased from requirements and architecture rather than from the current hook implementation alone.

Current `gog` understanding:

- `gog` is Gmail-native and follows Gmail naming and change semantics closely;
- `gog` watch payloads currently include:
  - top-level `historyId`
  - top-level `deletedMessageIds`
  - per-message `id`, `threadId`, `from`, `to`, `subject`, `date`, `snippet`, `body`, `bodyTruncated`, `labels`;
- current OpenClaw Gmail hooks consume only a reduced summary projection of that provider surface.

Working consequence:

- treat the current OpenClaw Gmail hook shape as an implementation detail, not the canonical email model;
- keep Gmail-native fields and mailbox/Maildir-native fields preserved in the adaptation layer even when OpenClaw does not yet consume them directly.

#### 17.11.8. Immediate Gmail / `gog` value already available

The most interesting Gmail-native fields already available from `gog`, but not currently used by the default OpenClaw Gmail hook mapping, are:

- `threadId`
- `labels`
- `to`
- `date`
- `historyId`
- `deletedMessageIds`
- `bodyTruncated`

These support immediate or near-immediate value:

- `labels`
  - show placement/category chips;
  - prioritize `STARRED`, `IMPORTANT`, and inbox-like mail sooner;
  - suppress or de-emphasize `SPAM` and `TRASH`.
- `threadId`
  - enable simple dedupe and "same conversation" hints without making rich threading a first-phase blocker.
- `to`
  - support direct-vs-list heuristics.
- `date`
  - improve recency ordering and time-window policies.
- `historyId`
  - provide replay and incremental-sync anchors.
- `deletedMessageIds`
  - preserve deletion events even when no message summary accompanies them.
- `bodyTruncated`
  - mark partial bodies explicitly so downstream ranking and display do not over-trust preview text.

Current implication:

- OpenClaw can extract more immediate operational value from the Gmail-native path before any major architectural change;
- the richer source surface should still be normalized into canonical fields rather than treated as a new Gmail-specific product model.

### 17.12. Source adapter contract and implementation suggestion

Implementation questions should be phrased from requirements and proposed architecture, not from today’s hook shape alone.

#### 17.12.1. Required adapter outputs

Any first-phase source adapter should emit at least:

- identity:
  - `source_account_id`
  - `provider_message_id` when available
  - `internet_message_id` when present
- content and participants:
  - `subject`
  - `snippet` or equivalent summary
  - `body_text` when cheaply available
  - `body_is_partial` when known
  - `from_address`
  - `to_addresses`
  - `date_header_at` when available
- placement and state:
  - `mailbox_memberships`
  - `is_read`
  - `is_flagged`
  - `is_draft`
  - `is_in_spam`
  - `is_in_trash`
- sync and replay:
  - `sync_observed_at`
  - `sync_origin`
  - `provider_history_id` when available
  - `source_change_type` when available

#### 17.12.2. Options

Option A: keep OpenClaw’s current summary-level Gmail hook shape as the effective adapter.

Pros:

- no additional integration work;
- fast path to wake-and-summarize behavior.

Cons:

- loses Gmail-native fields that are already available;
- weak replay and audit foundation;
- forces later schema and adapter churn.

Option B: add a richer Gmail-native adapter on top of the existing `gog` watch payload, while keeping the current wake path.

Pros:

- low-risk, incremental improvement;
- uses fields already available from `gog`;
- preserves current OpenClaw ergonomics while improving canonical field coverage.

Cons:

- still Gmail-first;
- still requires later Maildir-side normalization work.

Option C: wait and design only around Maildir ingest.

Pros:

- strongest local replay and provider-independence story.

Cons:

- delays immediate OpenClaw-visible gains from Gmail;
- throws away a rich provider-native source that already exists.

#### 17.12.3. Suggested first implementation

Recommended path:

- take Option B now;
- keep the existing OpenClaw Gmail hook as the wake and display trigger;
- add a richer adapter that preserves:
  - `historyId`
  - `deletedMessageIds`
  - `threadId`
  - `to`
  - `date`
  - `labels`
  - `bodyTruncated`;
- normalize those fields into the canonical model;
- keep Maildir as the first replay substrate;
- treat Gmail history as supplemental incremental-sync and audit evidence.

Why this is the best current suggestion:

- it satisfies the settled Maildir-first replay decision;
- it uses verified `gog` capabilities already on hand;
- it improves OpenClaw behavior without binding the project to Gmail as the canonical model;
- it reduces later adapter churn by preserving more source truth now.
