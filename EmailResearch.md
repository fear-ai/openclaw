# Emails Repositories: Inventory, Fit, and Reuse Notes

Updated: 2026-07-06
## Introduction

This document is the broad reference notebook for the email landscape under review:

- standards and protocol expectations;
- major providers and their behavioral differences;
- products and OSS repos;
- local source checkouts under `~/Work/Claw/Emails`;
- adoption, liveness, install/build shape, code structure, and reuse potential;
- broader opportunities for improved email integration coverage and functionality.

It is not the canonical place for implementation planning. Detailed integration design, field definitions, entity relationships, validation plans, and code-facing choices belong in the OpenClaw-maintained email docs.

## Concepts and Reference Posture

The main purpose of this file is comprehensive reference, not early optimization.

That means:

- start from authoritative semantics before product abstractions;
- treat provider behavior as important even when it drifts from the standards;
- preserve behavioral and relationship equivalence even when names differ;
- distinguish clearly between:
  - standards,
  - provider-native semantics,
  - local-store semantics,
  - OSS implementation choices,
  - product UX and policy choices.

## Levels of Standardization and Authoritativeness

Use the following hierarchy when deciding what counts as canonical versus merely influential:

1. Internet and mailbox standards
   - RFC 5322 header semantics;
   - MIME structure and part behavior;
   - SMTP transport semantics;
   - POP3 retrieval semantics;
   - IMAP mailbox, flag, and search semantics.
2. Durable storage and local-mail conventions
   - Maildir and Maildir++ layout;
   - index and tag systems such as `notmuch` where they preserve stable mailbox behavior.
3. Dominant provider semantics
   - Gmail labels, `threadId`, `historyId`, and category/system labels;
   - Outlook mailbox and category behavior;
   - Yahoo mailbox behavior and provider constraints.
4. Mature OSS implementations
   - useful because they reveal de facto capability partitions, install reality, and operational tradeoffs.
5. Product and vendor behavior
   - useful for workflow, terminology, and opportunity mapping;
   - weaker as a source of canonical semantics.

## Key Message Sources: Gmail, Outlook, Yahoo

Before looking at individual tools and products, the main provider differences should stay visible.

Common ground:

- all three ultimately exchange email through the broader SMTP/MIME/RFC 5322 ecosystem;
- all can participate in IMAP/SMTP-based workflows to varying degrees;
- all expose message identity, sender/recipient fields, dates, folders or mailbox placement, and read-state concepts;
- all can feed local mirrors, clients, or downstream classification systems.

Important differences:

| Source | Strongest distinguishing traits | Practical implications |
|---|---|---|
| Gmail | labels instead of pure folder semantics, `threadId`, `historyId`, strong category/system labels, strong provider spam handling | best event and metadata surface in the current set; easy to overfit to provider-native behavior |
| Outlook / Office 365 | Exchange/Graph and Outlook mailbox model, categories as distinct metadata, different auth and API posture | strong enterprise relevance; folder/category semantics differ from Gmail labels |
| Yahoo | more limited provider-native developer surface, more often approached through IMAP/SMTP and local-mail tools | important for proving generic mailbox support and non-Gmail resilience |

The practical consequence is that Gmail is often the richest event source, but the broader canonical email model still has to survive Outlook- and Yahoo-like environments.

## Tool and Service Taxonomy

The reviewed landscape is easier to reason about with a capability hierarchy rather than loose labels like "backend".

| Type | Main role | Typical examples |
|---|---|---|
| Standards and protocols | canonical transport, message, and mailbox semantics | SMTP, POP3, IMAP, MIME, RFC 5322 |
| Provider platforms | vendor-native mailbox and event surfaces | Gmail, Outlook, Yahoo |
| Auth and bridge tools | normalize OAuth or provider auth for mail protocols | `email-oauth2-proxy` |
| Ingress tools | fetch or deliver mail into a local store | `getmail6`, `hoardy-mail` |
| Sync and mirror tools | keep remote and local stores aligned | `neverest`, `offlineimap3`, `mbsync`, `cloud_mdir_sync` |
| Mailbox clients and interaction layers | read, search, reply, move, flag, and present mail | `himalaya`, `mutt` |
| Local index and tagging layers | search, tag, and thread over local stores | `notmuch` |
| Classification and triage engines | filter, rank, classify, summarize, or learn from feedback | `gmailsorter`, `MailSift-AI`, `clearmail`, `inbox-zero` |
| Workflow and team-mail products | assignment, routing, SLA, and collaboration around email | `Hiver`, `Fyxer` |
| Agent-native mailbox providers | provision mailbox-like surfaces directly for software agents | `AgentMail`, `LobsterMail` |

## Message Identity, Reply Tracking, and Similarity

This reference should not over-center threads just because Gmail does.

Priority concerns here are:

- tracking replies and re-replies reliably;
- preserving `Message-ID`, `In-Reply-To`, and `References` behavior;
- identifying related mail from the same or similar sources;
- detecting multiple copies of the same or near-same message sent to different accounts;
- distinguishing provider-native thread grouping from reply-chain evidence.

Thread UX is still worth documenting because it is common in Gmail and some products, but it should stay secondary to reply tracking, dedupe, source similarity, and repeated-message analysis.

## Priority Reference Families

Two families deserve extra attention throughout this file.

### Pimalaya family

The Pimalaya stack is important as a layered family rather than as one tool:

- shared mailbox abstractions and Maildir handling in `email-lib`;
- `himalaya` for mailbox interaction;
- `neverest` for sync and mirroring.

This family deserves extra attention for:

- detailed functionality;
- known limitations;
- naming and behavior consistency across the stack;
- interoperability with Maildir, IMAP, OAuth2, and downstream policy layers.

Current local auth reality is split:

- Himalaya is currently using Gmail app passwords retrieved from Keychain for both IMAP and SMTP;
- Himalaya also supports OAuth2 auth modes such as `xoauth2` and `oauthbearer`, plus keyring-backed secret storage;
- Neverest shares much of the same auth vocabulary, but is currently configured through command-based secret lookup rather than inline or keyring-native config.

### `gogcli`

`gogcli` is the strongest Gmail-native CLI/event bridge in the current local set.

Primary local focus:

- Gmail auth and account management;
- watch and history handling;
- webhook and serve flow;
- provider-native fields such as `threadId`, `historyId`, labels, and message ids.

Although practical use here is Gmail-first, `gogcli` is broader than that. It
also exposes a wider Google API surface through one CLI, including Calendar,
Drive, Docs, Sheets, Slides, Tasks, People, Forms, Chat, Groups, Admin, and
Apps Script. That broader capability matters for:

- comparing Google-native CLI ergonomics against IMAP/Maildir tools;
- evaluating which Google operations belong in Gmail-native tooling versus more
  schema-driven API tooling;
- future OpenClaw and Setpack integrations that may need more than Gmail.

Current local auth and secret observations worth preserving here:

- shared OAuth client credentials live in `credentials.json`;
- per-account refresh tokens can live in Keychain or in the file-backed keyring;
- current local archival material also includes per-account JSON token exports containing `client`, `email`, `created_at`, `refresh_token`, `services`, and `scopes`;
- older raw `gogcli_*.json` token files exist too, but the export-style files are the better restore format;
- installed CLI syntax last verified locally is:
  - `gog auth credentials set <credentials.json>`
  - `gog auth add <email> --services gmail --gmail-scope readonly`
  - `gog auth tokens export <email> --out <file>`
  - `gog auth tokens import <file>`
  - `gog auth keyring auto|keychain|file`

### `gws`

`gws` sits even further toward the Google API surface than `gogcli`.

Role in the current set:

- schema-first Google Workspace API CLI;
- lower-level and more resource/method-oriented than `gogcli`;
- useful when the problem is direct API invocation rather than Gmail-native or
  workflow-friendly operations.

Current local state worth preserving here:

- local config directory is `~/.config/gws`;
- current visible files include:
  - `client_secret.json`
  - `credentials.enc`
  - `token_cache.json`
  - API cache files under `cache/`

Practical distinction from `gogcli`:

- `gogcli` is the stronger human-scale operational CLI and Gmail-native bridge;
- `gws` is the stronger direct Google API surface for structured, schema-driven
  operations;
- both matter, but they should not be treated as interchangeable.

## Goals and Wants Alignment

- `G1` Secure Gmail connectivity on Mac with minimal moving parts.
- `G2` Multi-account inbox ingestion and routing.
- `G3` Cost control (local-first where practical, reduced paid API dependence).
- `G4` Components that can be integrated into OpenClaw workflows.

## License Availability and Reuse Gate

Direct code lift is only safe from repos with a real license grant. Repos without a license file should be treated as reference only unless the owner clarifies reuse rights.

| Repo | License Evidence | Gate |
|---|---|---|
| `himalaya` | `LICENSE`, MIT | Direct code reuse permitted. |
| `neverest` | `LICENSE`, MIT | Direct code reuse permitted. |
| `gogcli` | `LICENSE`, MIT | Direct code reuse permitted. |
| `email-oauth2-proxy` | `LICENSE`, Apache-2.0 | Direct code reuse permitted with NOTICE/patent terms respected. |
| `gmailsorter` | `LICENSE`, BSD-3-Clause | Direct code reuse permitted. |
| `emailgenius` | `LICENSE`, MIT | Direct code reuse permitted. |
| `MailSift-AI` | `LICENSE`, MIT with attribution wording | Reuse possible, but retain attribution requirements explicitly. |
| `cloud_mdir_sync` | `COPYING`, GPL-family license text in repo | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `dovecot` | `COPYING`, `COPYING.LGPL`, `COPYING.MIT` | File-level review required: MIT parts are selectively reusable, LGPL parts are not suitable for direct lift by default. Treat mostly as architecture/reference source. |
| `getmail6` | `COPYING`, GPL-2.0 | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `hoardy-mail` | `LICENSE.txt`, GPL-3.0 | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `mutt` | source headers and `COPYRIGHT` indicate GPL licensing | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `notmuch` | `COPYING`, GPL-3.0-or-later | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `offlineimap3` | `COPYING`, GPL-2.0-or-later text in repo | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `isync` / `mbsync` | `COPYING`, GPL-2.0 | Do not lift code into OpenClaw directly; use as sidecar or clean-room reference. |
| `inbox-zero` | `LICENSE`, AGPL-3.0 license file | Treat as architecture/pattern source unless deliberate AGPL compatibility decision is made. |
| `clearmail` | no license file; `package.json` says `ISC` | Treat as reference only until the repo carries an actual license grant. |
| `gmailLoader` | no license file; `package.json` says `ISC` | Treat as reference only until the repo carries an actual license grant. |

## Integrated Synthesis Across OSS and Commercial Vendors

### 1) Terminology and Taxonomy Crosswalk

This normalizes language used by OSS projects (`inbox-zero`, `gmailsorter`, `clearmail`, `MailSift-AI`) and commercial tools (`Cora`, `Fyxer`, `SaneBox`, `Shortwave`, `Hiver`).

| Canonical Dimension | OSS Terms and Patterns | Commercial Terms and Patterns | Operational Meaning |
|---|---|---|---|
| Conversation state | `TO_REPLY`, `AWAITING_REPLY`, `FYI`, `ACTIONED` (`inbox-zero`) | follow-up, pending, needs response | Is this mail actionable now, later, or done? |
| Content class | `NEWSLETTER`, `MARKETING`, `RECEIPT`, `NOTIFICATION`, custom labels (`inbox-zero`, `clearmail`, `gmailsorter`) | newsletter/news, promos, receipts, updates, digest buckets | What type of message is this? |
| Sender intent/risk | cold-email detection, spam/not-spam + preference score (`MailSift-AI`) | cold email blocker, spam/noise filtering | Is this trusted, risky, irrelevant, or sales outreach? |
| Priority/importance | High/Low priority (`MailSift-AI`), keep/reject (`clearmail`) | priority inbox, important-first views | What must be seen immediately? |
| Action outcome | `LABEL`, `ARCHIVE`, `DRAFT_EMAIL`, `SEND_EMAIL`, `MARK_READ`, `MARK_SPAM`, `DIGEST` (`inbox-zero`) | archive/snooze/split/pin/assign/digest | What should the system do next? |
| Routing/collaboration | queues, rule execution logs, shared mailbox primitives (`inbox-zero`) | shared inbox, assignment, SLA, routing (Hiver) | Who owns this message and by when? |
| Learning/adaptation | label-learning (`gmailsorter`), natural-language rules (`clearmail`) | “learns your patterns”, “shape behavior by chat” (Cora/Fyxer style) | How behavior improves over time |

### 2) Feature and Method Taxonomy

| Method Family | What It Does | OSS Coverage | Commercial Coverage | Strengths | Risks/Tradeoffs |
|---|---|---|---|---|---|
| Deterministic rules and filters | sender/domain/regex/category routing | Strong (`clearmail`, `inbox-zero` rule model) | Strong (`SaneBox`, `Hiver`, parts of `Fyxer`) | Explainable, cheap, stable | brittle on ambiguous text |
| Similarity/ML label prediction | learns from existing user labels | Strong (`gmailsorter`) | Medium (behavior-learning claims) | personal fit, low prompt cost | cold-start + concept drift |
| LLM classification and summarization | classify intent/content, generate rationales/summaries | Strong (`inbox-zero`, `emailgenius`, `gmailLoader`) | Strong (`Cora`, `Fyxer`, `Shortwave`) | handles ambiguity, richer context | token cost + false positives |
| Hybrid rule + AI pipeline | deterministic first, AI on residual ambiguity | Available in `inbox-zero` patterns and feasible in OpenClaw | Present in top SaaS tools | best balance of precision/cost | requires careful policy design |
| Team workflow automation | assignment, SLA, queueing, ticketing | Limited in OSS set except `inbox-zero` patterns | Strong (`Hiver`) | operational accountability | heavier process overhead |
| Digest and attention management | batch low-priority streams into review summaries | `inbox-zero`, can be built in OpenClaw hooks | Strong (`SaneBox`, `Cora`, `Shortwave`) | reduces interruption load | risk of missing urgent edge cases |

### 3) Key Use Cases and Practical Approaches

| Use Case | Primary Audience | Preferred Approach | Most Relevant Systems |
|---|---|---|---|
| Personal inbox triage with strong control | individual operator, founder, IC | rule-first + AI residual classification + digest | OpenClaw + Gmail hooks, Cora, Fyxer, SaneBox |
| Multi-account consolidated processing | consultant, operator managing many inboxes | account-isolated ingestion + shared taxonomy + per-account policy | OpenClaw + Gmail/IMAP bridge, Fyxer Pro, SaneBox multi-account tiers |
| Team/shared support mailbox operations | support/success teams | assignment + SLA + routing + status + audit trail | Hiver (primary), Inbox Zero patterns |
| Cost-sensitive self-hosted experimentation | technical user, small team | IMAP/OAuth bridge + deterministic filters + selective LLM calls | OpenClaw + himalaya/email-oauth2-proxy + gmailsorter/clearmail patterns |
| Outbound send-time optimization | lifecycle/marketing teams | engagement-time optimization, not inbox triage | Seventh Sense (adjacent category) |

### 4) Target Audiences and Expected Environments

| Audience | Typical Environment | Must-Have Capabilities | Best-Fit Options |
|---|---|---|---|
| Power individual on Mac | single machine, Gmail-first | reliable triage, low setup friction, clear override path | OpenClaw Gmail flow, SaneBox, Cora |
| Technical operator/self-hoster | Mac/Linux + containers/VPS | transparent policy, composability, exportable logs | OpenClaw + OSS components (`himalaya`, `email-oauth2-proxy`) |
| Startup team | Google Workspace + shared inboxes | assignment, SLA, collaboration, analytics | Hiver, Fyxer team tiers |
| Security-sensitive org | controlled cloud/VPC + policy controls | auth hardening, auditability, retention controls | OpenClaw self-host + strict policy; enterprise SaaS only after compliance validation |

### 5) Must-Have Benefits (Decision Gate)

Minimum benefit set to justify adoption over stock Gmail:

1. Lower interruption rate without increasing missed-important-mail incidents.
2. Better precision in `important/action-required` detection than baseline inbox tabs/filters.
3. Explicit and editable policy controls (not opaque one-shot automation).
4. Multi-account isolation with no cross-account label/action leakage.
5. Auditability: each action traceable to rule/model/confidence and reversible where possible.
6. Cost control: bounded token/API usage and predictable monthly total cost.

### 6) Prioritization Framework for Decision Making

Use weighted scoring for shortlist decisions:

| Criterion | Weight | Why It Matters |
|---|---|---|
| Fit to triage/filter/priority use case | 25% | Core mission, not optional |
| Control and explainability | 20% | Required to tune and trust outcomes |
| Security and data handling posture | 20% | Email content is high sensitivity |
| Multi-account capability | 15% | Key target requirement |
| Cost efficiency and predictability | 10% | Ongoing operational viability |
| Integration effort with OpenClaw | 10% | Delivery speed and maintenance burden |

Current prioritization by category:

- `P0` Foundation: OpenClaw Gmail auth/watch path + IMAP fallback path (`himalaya`, `email-oauth2-proxy`).
- `P1` Policy quality: deterministic taxonomy + AI residual classification + confidence thresholds.
- `P2` Productivity overlays: digest, draft suggestions, sender-level learned preferences.
- `P3` Team workflows: assignment/SLA/routing features if/when team mailbox operations become primary.
- `P4` Adjacent optimization: outbound send-time systems (Seventh Sense) only if marketing automation becomes in-scope.

### 7) Shortlist Guidance by Objective

If objective is immediate personal triage control:

- Shortlist first: `OpenClaw + Gmail hooks`, `SaneBox`, `Fyxer`.
- Evaluate `Cora` for UX quality, but gate on missing vendor transparency details.

If objective is self-hosted controllable architecture:

- Build baseline on: `OpenClaw + himalaya/email-oauth2-proxy`.
- Borrow methods from: `inbox-zero` (rule/action model), `gmailsorter` (label-learning pattern).

If objective is team shared operations:

- Prioritize `Hiver`-style routing/assignment semantics and compare against extending OpenClaw with workflow modules.

## Reuse Opportunities and Challenges

Language and integration shape:

- TypeScript/Node repos (`clearmail`, `gmailLoader`, `inbox-zero`) are easiest for direct component lift into OpenClaw-side adapters, but monorepo-heavy code (`inbox-zero`) raises coupling risk.
- Python repos (`email-oauth2-proxy`, `emailgenius`, `gmailsorter`, `MailSift-AI`) are best reused as sidecar services/CLI workers, not in-process.
- Rust repos (`himalaya`) are strong for reliability/security-sensitive mail plumbing, but integration is via process boundary or API wrapper.

Module profile and practical fit:

- Low-coupling modules (IMAP/OAuth/connectivity) are best candidates for immediate reuse.
- High-coupling app stacks (full UI + orchestration + persistence) are better for pattern borrowing than code import.
- ML-heavy stacks (`torch`/`transformers`) are useful for local classification experiments, but add runtime and packaging burden.

License/SPDX implications:

- Clear permissive SPDX (`MIT`, `Apache-2.0`, `BSD-3-Clause`) supports reuse with attribution/compliance.
- `NOASSERTION` or missing SPDX in metadata means rights are not confirmed at metadata level; verify `LICENSE` manually before code lift.
- If license state is unclear, treat repo as concept/reference only until clarified.

## Reuse Matrix (OSS Implementations)

| Repo | Reuse Mode | What to Reuse | Primary Code References | Constraints / Risks | Recommended Next Step |
|---|---|---|---|---|---|
| `gogcli` | Gmail-native bridge / optional sidecar | Gmail auth flow, watch/history bridge, webhook payload model, provider-native message and label semantics, credential-storage patterns | `../Emails/gogcli/README.md`, `../Emails/gogcli/docs/watch.md`, `../Emails/gogcli/docs/spec.md` | Gmail-only and Go-specific; less useful as a generic mailbox abstraction | Treat as the first-class Gmail-native reference and compare its event/history surface against Maildir-first and Pimalaya paths |
| `email-oauth2-proxy` | Sidecar service | OAuth2 bridge for IMAP/POP/SMTP, multi-account auth normalization, provider coverage beyond Gmail | `../Emails/email-oauth2-proxy/README.md` | Separate Python runtime and process management | Build a local sidecar PoC for one non-Gmail account and document adapter contract for OpenClaw |
| `neverest` | Pattern borrow + optional sync sidecar | Gmail/IMAP -> Maildir mirror, backup/restore flow, OAuth2 and keyring configuration patterns, local historical store discipline | `../Emails/neverest/README.md` | Rust project boundary; sync state and local mirror lifecycle add operational complexity | Validate one Gmail -> Maildir account and compare its local mirror behavior against direct OpenClaw Gmail ingestion |
| `getmail6` | Optional ingress sidecar | Mature POP3/IMAP retrieval into Maildir, Gmail-specific examples, simple delivery-focused fetch path | `../Emails/getmail6/README`, `../Emails/getmail6/docs/getmailrc-examples` | Ingress-focused rather than full sync; weaker mailbox management and audit surface | Prototype one Gmail -> Maildir fetch path and normalize its message identity/error contract for OpenClaw |
| `offlineimap3` | Optional sync sidecar | IMAP <-> Maildir mirror semantics, account catch-up and backfill pattern, long-history local store support | `../Emails/offlineimap3/README.md` | Sync conflict and state complexity; maintenance cadence is less convincing than the simpler ingress tools | Keep as the fuller mirror reference when local history fidelity matters more than operational simplicity |
| `isync` / `mbsync` | Optional sync sidecar | Lightweight IMAP <-> Maildir synchronization with simple local state files and strong offline-mail workflow fit | `https://isync.sourceforge.io/`, `https://github.com/gburd/isync` | C implementation and external config/process boundary; Gmail auth setup is less turnkey than `getmail6` or `neverest` | Keep as the lightweight mirror baseline when operational simplicity and Maildir-first workflows matter more than richer provider setup help |
| `hoardy-mail` | Optional ingress + safe-expire sidecar | Explicit IMAP -> Maildir or MDA fetch with strong Yahoo/Hotmail/Gmail recipe coverage, plus safe batch delete/mark workflows | `../Emails/hoardy-mail/README.md` | GPL-3.0 and small-project footprint; less polished onboarding than the Pimalaya tools | Keep as the strongest explicit Yahoo -> Maildir reference and as a safety-oriented fetch/delete design source |
| `cloud_mdir_sync` | Optional cloud API mirror sidecar | Gmail API and Office365 Graph -> Maildir synchronization with local Maildir monitoring and upload-back path | `../Emails/cloud_mdir_sync/README`, `../Emails/cloud_mdir_sync/doc/imap.md`, `../Emails/cloud_mdir_sync/doc/smtp.md` | GPL-2.0 family and narrower protocol surface; provider-specific rather than general IMAP | Use as a design reference when API-native cloud mailbox sync is preferable to IMAP |
| `himalaya` | Pattern borrow + optional process wrapper | Account model, IMAP/SMTP/OAuth2/keyring configuration patterns, secure multi-account layout | `../Emails/himalaya/config.sample.toml`, `../Emails/himalaya/README.md` | Rust project boundary; direct code lift into TS is not practical | Mirror its account/auth schema shape in OpenClaw config and test with one Gmail + one IMAP provider |
| `inbox-zero` | Pattern borrow (selective only) | Rule taxonomy, action defaults, execution history/audit model, guarded AI classification flow | `../Emails/inbox-zero/apps/web/utils/rule/consts.ts`, `../Emails/inbox-zero/apps/web/prisma/schema.prisma`, `../Emails/inbox-zero/apps/web/utils/cold-email/is-cold-email.ts` | AGPL + additional license terms; avoid direct copying until legal review | Reimplement equivalent abstractions in OpenClaw from concepts, not source copy |
| `gmailsorter` | Method borrow / optional worker | Supervised label-learning method (feature encoding + per-label RF models + confidence threshold) | `../Emails/gmailsorter/gmailsorter/ml/encoding.py`, `../Emails/gmailsorter/gmailsorter/ml/model.py` | Python ML dependency footprint and model lifecycle ownership | Prototype as an offline trainer + inference worker, then compare against LLM-only baseline |
| `MailSift-AI` | Concept borrow only (initially) | Two-stage triage idea: spam score then preference relevance score | `../Emails/MailSift-AI/modules/mail_sorter.py`, `../Emails/MailSift-AI/modules/spam_detector.py`, `../Emails/MailSift-AI/modules/user_preference.py` | Small project maturity; license text is non-standard wording | Reuse approach as design pattern and reimplement minimal version in OpenClaw-native code |
| `clearmail` | Concept borrow only | Natural-language rule prompting, simple keep/reject routing idea | `../Emails/clearmail/analyzeEmail.js`, `../Emails/clearmail/processEmails.js` | Security issue (`rejectUnauthorized: false`), no top-level LICENSE file | Do not lift code directly; extract only taxonomy/rule ideas |
| `gmailLoader` | Low-priority reference | Basic Gmail fetch + classify workflow decomposition | `../Emails/gmailLoader/routes/auth.js`, `../Emails/gmailLoader/utils/classifyMails.js` | No top-level LICENSE; model/API usage appears outdated | Keep as historical reference only unless modernized fork is created |
| `emailgenius` | Low-priority reference / optional prototype | IMAP ingestion + interactive categorization flow for manual experimentation | `../Emails/emailgenius/src/main.py`, `../Emails/emailgenius/src/utils.py` | Dated dependencies and mixed framework stack | Use only for quick UX experiments; avoid production integration |

### Recommended Reuse Order for OpenClaw

1. Start with Gmail-native bridge and connectivity references: `gogcli`, `email-oauth2-proxy`, and `himalaya`-style account modeling.
2. Add Maildir ingress and local mirror options: `neverest`, `getmail6`, `offlineimap3`, `isync` / `mbsync`.
3. Add policy layer: `inbox-zero`-style taxonomy + action/audit model (clean-room implementation).
4. Add learned priors: `gmailsorter`-style label-learning worker before LLM classification.
5. Keep lower-maturity repos (`clearmail`, `gmailLoader`, `emailgenius`, `MailSift-AI`) as pattern references, not direct dependencies.

## Commercial Vendor Investigation (Sorting, Filtering, Labeling, Prioritization)

Updated: 2026-02-19

### Scope and Method

- Targeted vendors requested: `cora.computer`, `theseventhsense.com`, `fyxer.com`, `clean.email` (including the comparison page), `sanebox.com`, `shortwave.com`, `hiverhq.com`.
- Focused on direct fit to our use case: better control of filtering/blocking/labeling/prioritization/notification than stock Gmail.
- Preference order for evidence:
  - official product/pricing/security pages,
  - first-party structured metadata (`application/ld+json`),
  - established press coverage for funding/adoption context,
  - third-party review aggregations as secondary signal only.

### Quick Decision Matrix

| Vendor | Relevance to Our Use Case | Core Filtering Terminology | Prioritization / Presentation Features | Multi-Account Notes | Pricing Snapshot | Vendor Profile and Business Signals | Recommendation |
|---|---|---|---|---|---|---|---|
| `Cora` | High (personal inbox triage) | "screens your email", keeps important mail in inbox, categorization + briefing | Inbox screening, auto-drafts, brief summaries | Gmail-first today; Outlook/others listed as "coming soon" | Site currently states `$20/month`; free trial | Founding/size/funding not clearly disclosed; privacy page lists San Francisco address | Strong UX reference; high unknowns for enterprise-grade evaluation |
| `Fyxer` | High (triage + drafting + team use) | actionable labels, spam/noise filtering, instant categorization | Priority inbox shaping, labeling, drafting in user voice, attachment-aware and CRM-aware workflows (Pro) | Explicit multi-inbox support in Pro trial description | Structured data shows Starter `USD 30` monthly / `USD 22.50` annual, Pro `USD 50` monthly / `USD 37.50` annual, Enterprise via sales | Site metadata: founding date `2023`; site claim `100,000+` users; external coverage reports `$10M` seed | Strong candidate for terminology + workflow patterns |
| `SaneBox` | High (classic filtering/prioritization) | SaneLater, SaneNews, SaneNoReplies, SaneBlackHole, SaneCC, SaneReminders | Digest-first triage and deferred folders; focused filtering UX | Plans include 1+ account variants | Embedded pricing data exposes plans from `~$4.95/mo` up through multi-account "Dinner" tiers | Company story says started in `2010`; funding/size not clearly disclosed | Strong benchmark for deterministic filtering semantics |
| `Shortwave` | Medium-High (organization + workflow) | Bundles, Splits, threading/pinning model | Custom splits, pinned threads, workflow-oriented UI | Gmail-centric product positioning | Pricing page currently renders Business `24`, Premier `36`, Max `100` per seat/month billed annually | TechCrunch (2022) reports `$9M` seed; homepage says used by "thousands of companies" | Strong UI/workflow benchmark; less explicit blocking semantics |
| `AgentMail` | Medium-High (agent-native mailbox provider) | API inboxes, webhooks, WebSocket notifications, threads, drafts | Agent-oriented receive/send and event delivery rather than human triage UI | Provider-managed agent inboxes rather than user multi-account mailbox consolidation | Commercial service; SDKs documented as OSS/MIT | Strong signal for agent-inbox provisioning and webhook/socket delivery semantics | Good architecture reference for agent-native mailbox provisioning; not a local-store answer |
| `LobsterMail` | Medium-High (agent-native mailbox provider) | agent inbox, real-time delivery, zero-config email for agents | Webhook or polling delivery, built-in safety framing, simpler operational story than Gmail Pub/Sub | Provider-managed agent inboxes rather than human multi-account mailbox operations | Commercial service; public docs/blog, no main OSS product repo found in this pass | Strong signal for simpler agent-email product design | Good benchmark for reducing Gmail/Workspace setup burden; not a Maildir or local-audit solution |
| `MailChannels` | Medium (outbound delivery infrastructure) | sending, delivery, tracking, transactional email infrastructure | Outbound-focused API and deliverability layer rather than inbound mailbox triage | Not a user mailbox product | Commercial infrastructure product | Useful as send-side separation reference | Good when outbound deliverability is the problem; not an inbox or fetch benchmark |
| `Hiver` | Medium (team support inbox, less personal triage) | Shared inbox, ticketing, routing, automation | Assignment/status/tagging workflows, SLA/business-hours constructs, analytics | Team/shared-mailbox oriented; strong multi-user model | Structured offers: Free, Lite `USD 19`, Growth `USD 29`, Pro `USD 49`, Elite sales-contact (annual basis in metadata) | Homepage claims `10,000+ teams`; structured rating `4.6` with `2000` reviews | Strong for multi-user routing/ops terminology; weaker fit for personal-only triage |
| `Seventh Sense` | Low-Medium (adjacent; outbound send-time optimization) | send-time optimization, engagement optimization | Improves delivery timing vs inbox-level filtering | HubSpot/Marketo ecosystem focus | Pricing calculator references platform/contact-volume model (examples shown on page for HubSpot/Marketo) | Public age/size/funding signals are sparse in first-party pages | Useful adjacent signal, but not a primary benchmark for inbox triage |
| `Clean Email` | Medium (product) + High (market comparison source) | Smart views, cleaning/unsubscribe/bulk actions | Bulk cleanup, categorization and management UX | Multi-account support is a core product theme | Plan details are partly JS-rendered; comparison page is better for feature language than hard pricing | Strong long-form comparison content; company finance/size details not strongly exposed in this pass | Keep as comparative terminology source; treat pricing/claims as secondary until cross-checked |

### Vendor Details and Extracted Signals

#### 1) Cora

- Product language and behavior:
  - "screens your email" and keeps important messages visible.
  - strong assistant framing: auto-draft + daily/periodic "brief" behavior.
  - explicit "chat/email Cora to change behavior" language is relevant for interactive rule shaping UX.
- Provider/channel fit:
  - current site FAQ states Gmail-only now; Outlook/other providers are listed as coming soon.
- Pricing/tiering:
  - homepage currently states `"$20 per month"` plus free trial CTA.
- Vendor profile:
  - privacy page lists a San Francisco address.
  - no clear first-party disclosure of headcount/funding/public revenue.
- Decision value:
  - good reference for "assistant-first inbox triage" semantics.
  - still needs due diligence on operational controls and enterprise readiness.

#### 2) Fyxer

- Product language and behavior:
  - inbox organized into "actionable labels", spam/noise filtered.
  - instant categorization + draft generation in user voice.
  - FAQ text indicates Pro adds multi-inbox handling, attachment reading, and CRM integration.
- Security posture signals (first-party claims):
  - SOC 2 Type II, ISO/IEC 27001, GDPR; HIPAA availability for enterprise tier.
- Pricing/tiering:
  - structured metadata on pricing page indicates:
    - Starter: `USD 30` monthly, `USD 22.50` annual,
    - Professional: `USD 50` monthly, `USD 37.50` annual,
    - Enterprise: sales process.
- Vendor profile:
  - first-party metadata includes founding date `2023`.
  - homepage claims `100,000+` users.
  - external reporting mentions a `$10M` seed raise.
- Decision value:
  - one of the strongest direct comparators for label/priority/draft workflows in our target space.

#### 3) SaneBox

- Product language and behavior:
  - explicit folder-taxonomy model:
    - `SaneLater`, `SaneNews`, `SaneNoReplies`, `SaneBlackHole`, `SaneCC`, `SaneReminders` (and related variants).
  - this is highly reusable as deterministic filtering vocabulary.
- Pricing/tiering:
  - pricing page embeds a broad matrix:
    - account-count plans (`1`, `2`, `3` accounts),
    - named plans (`Snack`, `Brunch`, `Lunch`, `Dinner`),
    - monthly/yearly/2-year cycles.
  - effective price points in embedded data span roughly `4.95/mo` upward depending on tier/accounts.
- Vendor profile:
  - about page states project origin in `2010`.
  - funding/headcount/location details are not clearly exposed in first-party docs reviewed here.
- Decision value:
  - top reference for deterministic, explainable filtering and "inbox deferral buckets."

#### 4) Shortwave

- Product language and behavior:
  - workflow terms: bundles/splits/threading/pinning and task-oriented inbox operations.
  - presentation is strong for high-throughput triage.
- Pricing/tiering:
  - pricing page currently renders:
    - Business `24`,
    - Premier `36`,
    - Max `100`,
    - all shown as per-seat/month billed annually.
- Vendor profile:
  - TechCrunch (2022) reported a `$9M` seed round.
  - homepage states usage by "thousands of companies."
- Decision value:
  - strong reference for interface and prioritization UX patterns, less explicit on "blocking" semantics than SaneBox.

#### 4a) AgentMail, LobsterMail, and MailChannels

- Product language and behavior:
  - `AgentMail` and `LobsterMail` represent the newer agent-email provider pattern: provision an inbox for an agent, receive by webhook or socket/poll, send programmatically, avoid the heavier Gmail Pub/Sub + personal-account setup path.
  - `MailChannels` is different: outbound infrastructure, not a general inbox product.
- Provider/channel fit:
  - these are not Outlook/Yahoo/Maildir references in the same sense as the OSS fetch tools;
  - they are mailbox or delivery providers with API-first semantics and hosted infrastructure assumptions.
- OSS/licensing state:
  - `AgentMail` documents open-source SDKs under MIT, but the mailbox service itself is commercial;
  - `LobsterMail` appears commercial, with public docs/blog but no main public product repo found in this pass;
  - `MailChannels` is commercial infrastructure, with public docs/support and ecosystem SDKs rather than a main OSS mail platform.
- Decision value:
  - useful when evaluating agent-native provisioning, webhook/socket delivery, and clean send-side separation;
  - not a substitute for local-store, Maildir, or sidecar-schema design.

#### 5) Hiver

- Product language and behavior:
  - team support model: shared inbox, ticketing, assignment/routing, automations, SLAs, analytics.
  - less personal-inbox-centric; stronger for collaborative operations.
- Pricing/tiering:
  - structured offers expose:
    - Free,
    - Lite `USD 19`,
    - Growth `USD 29`,
    - Pro `USD 49`,
    - Elite contact-sales.
  - page rendering also shows higher `/user/month` figures in visible cards; this mismatch should be manually verified before purchase decisions.
- Vendor profile:
  - homepage claim: `10,000+ teams`.
  - structured rating data on homepage: `4.6`, `2000` reviews.
  - structured address points to Newton, MA.
- Decision value:
  - useful for multi-user routing/status/assignment terminology; not the primary benchmark for individual mailbox triage.

#### 6) Seventh Sense

- Product language and behavior:
  - delivery/send-time optimization for HubSpot and Marketo.
  - primarily outbound campaign optimization, not inbox-level filtering/blocking.
- Pricing/tiering:
  - pricing workflow is calculator-style (platform + contact volume inputs).
  - page examples show HubSpot/Marketo reference points for monthly/annual costs at sample contact volumes.
  - observed examples on the page include:
    - HubSpot example at 5,000 contacts: about `USD 80/month` (`USD 960/year`),
    - Marketo example at 10,000 contacts: about `USD 450/month` (`USD 5,400/year`).
- Vendor profile:
  - privacy/legal pages expose contact/address details.
  - first-party pages reviewed do not clearly expose size/funding.
- Decision value:
  - adjacent benchmark for optimization concepts, but low direct fit to inbound mailbox triage controls.

#### 7) Clean Email

- Product language and behavior:
  - core positioning around inbox cleaning, unsubscribe, bulk handling, and organization.
  - its "best email manager apps" page is useful for broad feature taxonomy and comparative terminology.
- Pricing/tiering:
  - plan pages are heavily JS-rendered; hard pricing extraction is inconsistent in static fetches.
  - treat published plan numbers as "to verify manually in browser checkout flow."
- Vendor profile:
  - useful market-facing comparison source; business-size/funding details are not primary in reviewed pages.
- Decision value:
  - good for terminology and competitor landscape framing, lower confidence for deep vendor due-diligence fields.

### Cross-Vendor Terminology We Can Reuse

- Priority semantics:
  - `important`, `priority`, `urgent`, `to-reply`, `awaiting-reply`, `fyi`.
- Filtering buckets:
  - `newsletter`, `marketing`, `receipt`, `notification`, `cold-email`, `later`, `no-reply`.
- Action semantics:
  - `label`, `archive`, `snooze`, `digest`, `draft`, `route`, `assign`.
- Team/workflow semantics:
  - `shared inbox`, `SLA`, `routing`, `status`, `queue`.

### Terminology review against our usage criteria

Our criteria are: terms should be clear, distinguish state from action, distinguish placement from classification, and support explanation and reversal.

Recommended usage:

- use `content class` for what a message is
  - examples: `receipt`, `newsletter`, `notification`, `outreach`, `personal`, `support`
- use `mailbox membership` for where the message is placed by the provider or local store
  - examples: folder, label, category, tag, Maildir path
- use `priority state` for urgency and attention demand
  - examples: `urgent`, `today`, `later`, `ignore`
- use `action outcome` for what the system or user should do
  - examples: `archive`, `draft`, `send`, `forward`, `digest`, `assign`
- use `ownership state` for responsibility and workflow
  - examples: `unassigned`, `assigned`, `waiting`, `done`

Observed product and project drift:

- SaneBox-style `Later` and `NoReply` are placement or workflow buckets, not content classes.
- Fyxer/Cora-style `actionable` labels blend priority and action outcome.
- Gmail labels often mix content class, mailbox membership, and action hints in one mechanism.
- Outlook categories are metadata tags, not folders.
- `gmailsorter` treats labels as the learned target vocabulary.
- `inbox-zero` is the strongest reference for separating taxonomy, rules, and actions.

Design implication:

- OpenClaw should normalize imported terms into the canonical groups above, while preserving original provider or product aliases for display and search.

### Open Questions and Gaps

- Pricing verification gaps:
  - Hiver visible-card prices vs structured-data annual pricing are not perfectly aligned in one scrape pass.
  - Clean Email plan pricing is JS-heavy; static extraction is unreliable.
  - Seventh Sense pricing is calculator-driven, not a straightforward fixed-tier table.
- Vendor profile gaps:
  - first-party size/funding transparency is limited for Cora, SaneBox, Seventh Sense, and Clean Email.
  - for high-confidence procurement decisions, add one trusted business-data source per vendor and timestamp it.
- Product-fit gaps:
  - Seventh Sense appears materially outside our primary inbound-triage use case.
  - Hiver is strong for collaborative support desks but may overfit team-ticketing workflows vs personal inbox control.
- Review-quality gaps:
  - many user-review surfaces are marketing-curated; we still need neutral review sampling (G2/Capterra/Reddit threads) per vendor and per use case.

### Recommended Next Pass (Decision Support)

1. Define a short evaluation script (10-15 realistic email scenarios) and run it against top-fit vendors (`Fyxer`, `SaneBox`, `Cora`, `Shortwave`).
2. Normalize price comparison to one unit (`cost per mailbox per month`) and include minimum commitment terms.
3. Add a strict "control test" for false positives (important email incorrectly deprioritized).
4. Add a privacy/security verification checklist that includes retention controls, training-data policy, and admin auditability.

### External Sources Used

- Cora:
  - https://cora.computer/
  - https://cora.computer/privacy
- Seventh Sense:
  - https://www.theseventhsense.com/
  - https://www.theseventhsense.com/pricing
  - https://www.theseventhsense.com/privacy-policy
- Fyxer:
  - https://www.fyxer.com/
  - https://www.fyxer.com/pricing
- SaneBox:
  - https://www.sanebox.com/about
  - https://www.sanebox.com/pricing
  - https://www.sanebox.com/help/212-sanebox-folder-types
- Shortwave:
  - https://www.shortwave.com/
  - https://www.shortwave.com/pricing/
  - https://techcrunch.com/2022/08/09/shortwave-launches-its-email-client-to-rival-gmail-and-outlook/
- Hiver:
  - https://hiverhq.com/
  - https://hiverhq.com/pricing
  - https://economictimes.indiatimes.com/tech/funding/customer-service-platform-hiver-raises-4-million-in-series-a-funding-round/articleshow/89682150.cms
- Clean Email:
  - https://clean.email/best-emails-manager-app
  - https://clean.email/plans

### Source Confidence (for this pass)

| Source Type | Confidence for Decisions | Notes |
|---|---|---|
| Official pricing/product pages | High | Best for current feature names and tier structure, but dynamic rendering can hide details. |
| First-party structured metadata (`application/ld+json`) | High-Medium | Very useful for machine-readable pricing/rating fields; may lag visible UI variants. |
| Established press (e.g., TechCrunch) | Medium-High | Useful for funding/adoption context with explicit dates. |
| Regional business press | Medium | Useful but cross-check when numbers drive procurement decisions. |
| Vendor-curated testimonials and comparison pages | Medium-Low | Good for terminology and positioning; weaker for neutral quality scoring. |

## Area A: Connectivity and Auth Foundations

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `himalaya` | `G1 G2 G4` | Rust CLI | `imap`, `smtp`, `maildir`, `notmuch`, `oauth2`, `keyring`, `tokio`, `clap` | High | High (pushed 2026-03-31; latest release `v1.2.0`) | 5.8k stars / 170 forks / 46 issues | MIT; permissive, low-friction reuse with attribution. |
| `email-oauth2-proxy` | `G1 G2 G4` | Python service/proxy | OAuth2 bridge for IMAP/SMTP/POP clients; dynamic requirements model | High | High (pushed 2026-02-24; latest tagged release `2025-10-04`) | 1.4k stars / 139 forks / 2 issues | Apache-2.0; permissive with NOTICE/patent terms. |

Notes:
- These two are strongest for a secure staged path: Gmail auth/connectivity first, AI triage later.
- For OpenClaw integration, `email-oauth2-proxy` can reduce direct credential sprawl in custom IMAP adapters.
- Himalaya is especially useful here because the repo and current local config show both sides of the auth story: app-password operation now, OAuth2-capable configuration when that becomes worth the added setup burden.
- Pimalaya Cargo note: source builds are straightforward, but install-mode resolution should use the lockfile. For local source installs, prefer `cargo install --path . --locked`; unlocked install mode can select crates.io dependencies differently from the checked-out repo.

## Area B: Gmail Sorting / Triage Engines

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `gmailsorter` | `G2 G3 G4` | Python (+ optional web/Docker) | `google-api-python-client`, `google-auth(-oauthlib)`, `numpy`, `pandas`, `flask` | Medium | High (pushed 2026-03-31; latest release `gmailsorter-0.1.6`) | 19 stars / 1 fork / 4 issues | BSD-3-Clause; permissive reuse, keep attribution/no-endorsement terms. |
| `clearmail` | `G2 G3 G4` | Node.js | `imap`, `mailparser`, `openai` | Low-Medium | Low (last push 2024-02-13) | 90 stars / 12 forks / 2 issues | No SPDX detected; treat as unclear until license file is confirmed. |
| `emailgenius` | `G2 G4` | Python API/app | `fastapi`, `Flask`, `imap-tools`, `langchain`, `openai`, `google-*`, `numpy`, `pandas` | Low-Medium | Low (last push 2023-11-29) | 32 stars / 5 forks / 2 issues | MIT; permissive reuse if maintained forking burden is acceptable. |
| `gmailLoader` | `G2 G4` | Node.js / React utility | `googleapis`, `@react-oauth/google`, `openai` | Low | Low (last push 2024-06-12) | 3 stars / 0 forks / 0 issues | No SPDX detected; confirm license before code lift. |
| `MailSift-AI` | `G2 G3` | Python ML | `torch`, `transformers`, `datasets`, `pandas`, `numpy`, `safetensors` | Low | Low-Medium (last push 2025-03-02) | 5 stars / 0 forks / 0 issues | No SPDX detected; verify rights before direct reuse. |

Notes:
- Best near-term extraction candidate from this group is `gmailsorter` (clearer structure + active upkeep).
- Several repos are useful for ideas/prototypes but weak for production lift without maintenance ownership.

## Area C: Full Product Inbox Automation

| Repo | Fit | Language / Stack | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|
| `inbox-zero` | `G2 G3 G4` | TypeScript monorepo (web + workers + integrations) | `@ai-sdk/*`, `openai`, `@googleapis/*` (Gmail/Drive/Calendar), `next`, `react`, `prisma`, `redis`, `nodemailer`, `ollama-ai-provider-v2`, `@ai-sdk/mcp` | High | High (pushed 2026-04-01; latest release `v2.29.2`) | 10.4k stars / 1.25k forks / 109 issues | SPDX undetected at repo metadata; license file exists but requires explicit legal check before component lift. |

Notes:
- Strong adoption and active development; good source for architecture patterns.
- For selective integration into OpenClaw, prioritize bounded components (message classification pipeline, provider adapters) over broad code import.

## Area D: Maildir Ingress and Mirror Foundations

| Repo | Fit | Language / Stack | Provider Coverage Signal | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|---|
| `neverest` | `G1 G2 G4` | Rust CLI | Gmail and Outlook explicitly documented; Yahoo not explicitly documented | sync/backup/restore flow, Maildir mirror, OAuth2, keyring, folder alias model | Medium-High | Medium (last push 2024-12-19; latest release `v1.0.0-beta`) | 298 stars / 10 forks / 15 issues | MIT; permissive, but still beta and narrower community signal. |
| `getmail6` | `G1 G2 G4` | Python CLI | Gmail explicit; Office 365 and Hotmail explicit; Yahoo not explicitly documented | POP3/IMAP retrieval, Maildir delivery, Gmail XOAUTH helpers, fetch-only path | High | High (pushed 2026-03-21; latest release `v6.19.12`) | 158 stars / 50 forks / 7 issues | No SPDX in repo API; practical reuse is OK as sidecar, but license handling needs care. |
| `offlineimap3` | `G1 G2 G4` | Python CLI | Gmail explicit and strongest label fidelity; Office 365 mentioned; Yahoo not explicitly documented | IMAP <-> Maildir sync, `GmailMaildir`, label sync, long-history mirror | High | Medium-High (pushed 2025-10-28; no GitHub releases, latest local tag `v8.0.1`) | 605 stars / 76 forks / 70 issues | No SPDX in repo API; strong technical reference, heavier operational surface. |
| `isync` / `mbsync` | `G1 G2 G4` | C CLI | Generic IMAP only in current docs; Outlook and Yahoo are inferential, not named | Maildir <-> IMAP sync, simple local state files, lightweight offline workflow | Medium | Low (last push 2013-01-30; no GitHub releases) | 46 stars / 1 fork / 8 issues | GPL-2.0; useful as process-side tool, but old GitHub activity and sparse docs lower reuse confidence. |
| `hoardy-mail` | `G1 G2 G4` | Python CLI | Gmail, Yahoo, Hotmail, and Yandex explicitly documented | IMAP -> Maildir or MDA fetch, batch mark/delete, safe backup/expire workflow | Medium | Medium-High (pushed 2025-10-09; latest release `v2.6.1`) | 15 stars / 1 fork / 0 issues | GPL-3.0; strong Yahoo reference, but sidecar/clean-room only for OpenClaw use. |
| `cloud_mdir_sync` | `G1 G2 G4` | Python service/daemon | Gmail and Office365 explicitly documented; Yahoo not documented | cloud API -> Maildir sync, Office365 Graph path, Gmail API path, local Maildir change upload | Medium | High (pushed 2026-02-18) | 23 stars / 13 forks / low issue signal | GPL-2.0 family in repo; useful API-native mirror reference, sidecar/clean-room only. |

Notes:
- `offlineimap3` is still the strongest Gmail-metadata preservation reference in this set.
- `getmail6` is the most mature simple ingress tool.
- `neverest` is the cleanest forward-looking Rust mirror candidate, but it remains beta.
- `isync` / `mbsync` is a useful baseline for lightweight generic IMAP-to-Maildir sync, not for rich Gmail semantics.
- `neverest` install note: `cargo install --path . --locked` works; plain `cargo install --path .` can fail by resolving crates.io `pimalaya-tui` instead of the git-patched dependency graph recorded in `Cargo.lock`.
- Suggested upstream note/fix:
  - docs change: add `--locked` to local source install guidance in `README.md`
  - likely code/config change to investigate: ensure install-mode resolution uses the intended patched dependencies without requiring the operator to discover `--locked`
  - suggested commit message: `docs: use cargo install --path . --locked for local installs`
  - suggested issue/PR text: `Local source installs can fail with plain \`cargo install --path .\` because install-mode dependency resolution may select crates.io \`pimalaya-tui 0.1.0\`, which lacks the \`build-envs\` feature required by this repo. \`cargo build\` works, and \`cargo install --path . --locked\` also works because it honors the checked-in lockfile and patched dependency graph. Recommend documenting \`--locked\` for local source installs in README, or otherwise making install-mode resolution align with the repo's intended dependency set.`

## Area E: Maildir Store, Index, and Client References

| Repo | Fit | Language / Stack | Provider Coverage Signal | Key Libraries / Modules | Maturity | Liveness | Community / Adoption | License / Reuse |
|---|---|---|---|---|---|---|---|---|
| `notmuch` | `G2 G4` | C indexer / CLI with Xapian | Local-store only; works over Maildir or MH, not a provider connector | Xapian-backed indexing, search, tagging, thread-based local query model | High | High (last push 2026-03-05) | Official project with long package/distribution presence; no GitHub-star signal used here because the primary repo is on its own forge | GPL-3.0-or-later; sidecar or clean-room reference only. |
| `dovecot` | `G1 G2 G4` | C server stack | Generic mail store/server reference, not a fetch client; useful for Maildir correctness and metadata behavior | Mail storage, IMAP/LMTP/LDA components, Maildir semantics, keyword and UID handling | High | High (last push 2026-04-01) | Strong real-world deployment signal; GitHub mirror exists but operational adoption matters more than forge metrics | Mixed MIT/LGPL with explicit file split; selective reuse only after file-level license review. |
| `mutt` | `G2 G4` | C terminal MUA | Generic IMAP and Maildir client; not a provider-specific fetch tool | Direct mailbox client, index/pager model, search/sort, Maildir compatibility, send/reply flows | High | High (last push 2026-03-30) | Long-lived classic client with durable operator adoption; GitLab primary repo, not a GitHub-centric project | GPL family; sidecar or clean-room reference only. |

Notes:
- `notmuch` is the strongest missing local index and query reference for large Maildir stores.
- `dovecot` is the strongest current reference for Maildir correctness, UID behavior, keyword mapping, and server-side storage semantics.
- `mutt` is useful as a classic direct-client comparison, but lower priority than `himalaya` for modern OpenClaw-facing interaction.

### Detailed findings: `notmuch`

`notmuch` is substantially more than "Maildir plus search". The codebase is larger because it implements a complete local mail indexing model:

- crawler:
  - `notmuch new` is a real incremental crawler, not a naive full rescan;
  - it tracks directory state and mtimes, detects Maildir by `cur/new/tmp`, and updates the database incrementally as files appear, disappear, or change.
- identity:
  - message identity is centered on `Message-ID`;
  - when that is absent or unsuitable, the project falls back to synthetic identity generation rather than making filename identity canonical;
  - one logical message may have multiple filenames and placements.
- threading:
  - threading is built from `Message-ID`, `In-Reply-To`, and `References`;
  - the engine creates ghost-message records so a thread can stay coherent even when some referenced messages are not locally present.
- query model:
  - rich fielded and boolean query language;
  - path, folder, tag, sender, subject, and date-like filters are treated as first-class concepts, not just free-text search.
- database shape:
  - message documents, ghost-message documents, and directory documents are all part of the internal model;
  - it stores file membership, tag state, thread relation, and directory metadata separately from raw message files.
- search/index engine:
  - `Xapian` is the embedded persistent search/index layer;
  - Maildir or MH remains the message-body store, while Xapian holds indexed terms, values, and queryable metadata.

Maildir flag and tag roundtrip semantics are especially worth borrowing conceptually:

- Maildir flags map into tags:
  - `D` -> `draft`
  - `F` -> `flagged`
  - `P` -> `passed`
  - `R` -> `replied`
  - `S` -> inverse of `unread`
- the sync is bidirectional when enabled:
  - filename flags can update tags during reindex/new;
  - tag changes can rewrite Maildir filenames back to flags.
- implementation details matter:
  - unrelated flags are preserved;
  - final Maildir flag order is normalized;
  - `new/` may be moved to `cur/` when flags need to be encoded;
  - malformed filename state is handled conservatively rather than rewritten blindly.

`notmuch` exclusion-tag behavior is another strong pattern reference:

- excluded tags such as `deleted` and `spam` are hidden by default;
- explicit query mention overrides the default exclusion;
- the engine supports multiple exclusion behaviors, including:
  - hidden from matches,
  - hidden even from thread context,
  - visible but specially counted.

The main lesson is that `notmuch` is not a candidate primary application database for OpenClaw. It is the strongest reference for:

- local identity and threading over file-backed mail,
- search/index separation from message storage,
- soft suppression and exclusion semantics,
- a small but useful Maildir-flag-to-local-state bridge.

### Detailed findings: Pimalaya `email-lib` Maildir backend

The reusable Pimalaya layer is not `neverest` itself. It is the shared Maildir backend in `email-lib`, which both `neverest` and `himalaya` sit on top of.

What the shared Maildir backend already provides:

- Maildir and Maildir++ handling via the Rust `maildirs` crate;
- folder add/list/delete/expunge;
- envelope get/list;
- message add/peek/get/copy/move/remove;
- flag add/set/remove;
- integrity checks;
- optional watch support;
- optional local threading support.

What the query layer already supports:

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

Important limits of the current Pimalaya Maildir layer:

- no persistent local full-text index equivalent to `notmuch`;
- no durable sidecar database for policy, audit, ranking, or custom attributes;
- local threading exists, but it is thinner than `notmuch`:
  - no ghost-message model,
  - no persistent thread/index database,
  - thread construction is based on currently visible local headers.
- body filtering reads/parses messages at query time rather than using a persistent search index.

This makes the Pimalaya stack the strongest Rust mailbox substrate in the current set for:

- Maildir operations,
- mailbox interaction,
- direct message and folder manipulation,
- watch hooks and local envelope processing.

It is not, by itself, the missing OpenClaw sidecar. If OpenClaw wants:

- richer prioritization,
- blocking and suppression policy,
- custom scores or judgments,
- long-lived replayable metadata,
- explainable action history,

those still need a separate local data model above the Pimalaya mailbox layer.

### ORM and schema notes: `Prisma` and `SQLAlchemy`

`Prisma` and `SQLAlchemy` matter here as evidence about their host projects, not as recommendations to change implementation environments mid-project.

`Prisma` in `inbox-zero`:

- explicit, migration-heavy, production application schema;
- strongly typed and broad enough to model accounts, watches, labels, rules, actions, digests, filing, messaging channels, and audit-ish state;
- best reference when the design question is:
  - what durable entities does a serious email product actually need?

In this context, `Prisma` is useful primarily as a schema-shaping reference, not because another project should copy Prisma itself.

`SQLAlchemy` in `gmailsorter`:

- lighter-weight and more compact;
- default SQLite deployment with optional other SQL backends;
- enough structure to separate:
  - messages and content,
  - threads,
  - labels,
  - participants,
  - OAuth token state,
  - ML artifacts and learned features.

In this context, `SQLAlchemy` is a strong reference for how a compact local worker or sidecar can remain queryable and evolvable.

Practical conclusion:

- `Prisma` is a strong reference for scope and entity breadth in a larger product schema;
- `SQLAlchemy` is a strong reference for a narrower local-worker schema with clear queryable structure;
- the durable lesson is about information partitioning and capability coverage, not ORM selection.

### Detailed findings: anti-spam technology, fields, and standards

Modern anti-spam systems are not evaluating only "spammy words". The stronger OSS engines repeatedly combine six signal families:

- authentication and provenance:
  - SPF, DKIM, DMARC, ARC, `Authentication-Results`, `Received`, PTR/rDNS, HELO/EHLO, envelope sender, domain alignment;
- sender and infrastructure reputation:
  - IP/domain reputation, DNSBL/URIBL/SURBL-style lookups, historical sender behavior, complaint rates, rate limits;
- structural and MIME integrity:
  - missing or malformed `Date`, `From`, `Message-ID`, broken MIME, suspicious HTML-only bodies, odd charsets, invisible text, attachment anomalies;
- lexical and statistical content:
  - subject/body phrases, token frequencies, Bayesian or other ML features, language detection, text/image balance;
- recipient and workflow headers:
  - `List-Id`, `List-Unsubscribe`, one-click unsubscribe support, `Auto-Submitted`, `Precedence`, reply-path anomalies, bulk/list conventions;
- link and attachment analysis:
  - URL host reputation, shorteners, mismatched visible text versus href, archive/password-protected attachments, executable payloads.

Key OSS implementation families:

- `SpamAssassin`:
  - rule language across `header`, `body`, `rawbody`, `uri`, `full`, `meta`, and `eval` tests;
  - best reference for "expression language over normalized mail features";
  - supports auth/reputation plugins such as DKIM/SPF/URIDNSBL alongside content rules.
- `Rspamd`:
  - score/symbol engine with actions like accept, add header, greylist, reject;
  - native emphasis on modern auth (`SPF`, `DKIM`, `DMARC`, `ARC`), reputation, selectors, composite expressions, Lua plugins, Redis-backed reputation, and external services;
  - best reference for "modular scoring pipeline plus programmable symbols".
- `bogofilter`:
  - compact Bayesian token classifier;
  - best reference for "lightweight statistical spam probability", not for policy/audit/state.
- `DSPAM`:
  - historical statistical filtering and corpus-driven training;
  - useful mainly as a design reminder that preference and spam judgments often need feedback loops.

Important standards and conventions:

- `RFC 5322`: message format and core headers.
- `RFC 7208`: SPF.
- `RFC 6376`: DKIM.
- `RFC 7489`: DMARC.
- `RFC 8601`: `Authentication-Results`.
- `RFC 8617`: ARC.
- `RFC 2369`: `List-*` headers.
- `RFC 8058`: one-click unsubscribe.
- `RFC 3834`: `Auto-Submitted` and autoresponder conventions.
- `RFC 5228`: Sieve filtering language.
- `RFC 5235`: Sieve `spamtest` / `virustest` extensions.

Industry and project conventions that matter for OpenClaw:

- "spam" is only one class of suppression;
- "bulk", "list", "marketing", "newsletter", and "notification" should usually be modeled separately from true spam;
- authentication failures are strong features, but not the only blocking criterion;
- unsubscribe/list headers are strong evidence for "bulk but legitimate", not for "important";
- complaint/reputation signals are orthogonal to personal-priority signals.

Gmail relation:

- Gmail already performs a strong provider-level spam and category pass;
- Gmail sender guidance explicitly requires SPF or DKIM, DMARC for large senders, TLS, PTR/rDNS, RFC 5322 formatting, one-click unsubscribe for large senders, and keeping spam rate below `0.3%`;
- Gmail system labels and category labels are therefore valuable input features, but they should not be treated as the only truth for OpenClaw.

OpenClaw implication:

- blocking should likely use a conservative subset of anti-spam signals:
  - auth failures,
  - explicit spam/junk placement,
  - high-confidence bad reputation,
  - egregious malware/phish indicators;
- prioritization should use a different feature mix:
  - sender familiarity,
  - thread recency,
  - explicit asks,
  - mailbox placement,
  - list/bulk headers,
  - Gmail category/system labels,
  - local user feedback and learned patterns;
- "bulk but wanted", "bulk but ignorable", and "true spam" should stay separate classes.

### Definitive schema and invocation notes: `inbox-zero`

`inbox-zero` is the strongest reviewed example of a serious email workflow database rather than a mailbox mirror.

Database creation and configuration path observed in repo/docs:

- local development:
  - `docker compose -f docker-compose.dev.yml up -d`
  - `cd apps/web && pnpm prisma migrate dev && cd ../..`
- runtime / container path:
  - `npx prisma generate --schema=apps/web/prisma/schema.prisma`
  - `prisma migrate deploy --config=/app/docker/scripts/prisma.config.ts --schema=./apps/web/prisma/schema.prisma`
- datasource:
  - Prisma provider is `postgresql`
  - runtime also expects Redis / Upstash for queue/cache/workflow duties.

Definitive schema shape from `apps/web/prisma/schema.prisma`:

- identity and auth:
  - `User`, `Account`, `Session`, `EmailAccount`, `Verification`, `VerificationToken`, `ApiKey`;
- organization and access:
  - `Organization`, `Member`, `Invitation`, `SsoProvider`, `Premium`, `Payment`, `Referral`;
- provider watch / sync / token state:
  - `EmailAccount.watchEmailsExpirationDate`
  - `EmailAccount.watchEmailsSubscriptionId`
  - `EmailAccount.watchEmailsSubscriptionHistory`
  - `EmailAccount.lastSyncedHistoryId`
  - `EmailToken`
- taxonomy and learned grouping:
  - `Label`, `Category`, `Group`, `GroupItem`, `Newsletter`, deprecated `ColdEmail`;
- rules and actions:
  - `Rule`, `Action`, `RuleHistory`, `ExecutedRule`, `ExecutedAction`, `ScheduledAction`;
- message, thread, and response tracking:
  - `EmailMessage`, `ThreadTracker`, `ResponseTime`;
- digest and cleanup:
  - `Digest`, `DigestItem`, `CleanupJob`, `CleanupThread`;
- knowledge and chat sidecars:
  - `Knowledge`, `Chat`, `ChatMessage`;
- adjacent integrations:
  - `CalendarConnection`, `Calendar`, `MeetingBriefing`, `MessagingChannel`, `DriveConnection`, `FilingFolder`, `DocumentFiling`, `McpIntegration`, `McpConnection`, `McpTool`.

Important value vocabularies:

- `ActionType`:
  - `ARCHIVE`, `LABEL`, `REPLY`, `SEND_EMAIL`, `FORWARD`, `DRAFT_EMAIL`, `MARK_SPAM`, `CALL_WEBHOOK`, `MARK_READ`, `DIGEST`, `MOVE_FOLDER`, `NOTIFY_SENDER`;
- `SystemType`:
  - `TO_REPLY`, `FYI`, `AWAITING_REPLY`, `ACTIONED`, `COLD_EMAIL`, `NEWSLETTER`, `MARKETING`, `CALENDAR`, `RECEIPT`, `NOTIFICATION`;
- `ThreadTrackerType`:
  - `AWAITING`, `NEEDS_REPLY`, `NEEDS_ACTION`;
- `ExecutedRuleStatus`:
  - `APPLIED`, `APPLYING`, `SKIPPED`, `ERROR` plus deprecated historical values;
- `DigestStatus`:
  - `PENDING`, `PROCESSING`, `SENT`, `FAILED`;
- `ScheduledActionStatus`:
  - `PENDING`, `EXECUTING`, `COMPLETED`, `FAILED`, `CANCELLED`;
- `MessagingProvider`:
  - currently `SLACK`.

Practical conclusion:

- `inbox-zero` is not just storing message facts;
- it persists taxonomy, decisions, delayed actions, feedback-adjacent grouping, and provider watch state;
- this is the strongest schema reference for a future OpenClaw sidecar once Maildir filename capabilities stop being sufficient.

### Definitive schema and invocation notes: `gmailsorter`

`gmailsorter` does not use Prisma. It uses `SQLAlchemy`, defaulting to a local SQLite database.

Configuration and creation path observed in docs/code:

- Python or bare-metal environment variables:
  - `MAILSORT_ENV_CREDENTIALS_FILE=/path/to/credentials.json`
  - `MAILSORT_ENV_DATABASE_URL=sqlite:////path/to/email.db`
  - `MAILSORT_ENV_SECRET_KEY=...`
- app launch:
  - `python -m gmailsorter.webapp`
- manual daemon operations:
  - `gmailsorter-daemon -s -c ${MAILSORT_ENV_CREDENTIALS_FILE} -d ${MAILSORT_ENV_DATABASE_URL}`
  - `gmailsorter-daemon -u -c ${MAILSORT_ENV_CREDENTIALS_FILE} -d ${MAILSORT_ENV_DATABASE_URL}`
- creation model:
  - table creation is implicit through `Base.metadata.create_all(engine)` in the email, token, and ML database helpers.

Definitive table shape from code:

- core message tables:
  - `email_content`:
    - `email_id`, `email_subject`, `email_content`, `email_deleted`, `email_date`, `user_id`;
  - `email_threads`:
    - `email_id`, `thread_id`, `user_id`;
  - `email_labels`:
    - `email_id`, `label_id`, `user_id`;
  - `email_from`:
    - `email_id`, `email_from`, `user_id`;
  - `email_to`:
    - `email_id`, `email_to`, `user_id`;
  - `email_cc`:
    - `email_id`, `email_cc`, `user_id`;
- Google auth / app state:
  - `google_token`:
    - `token`, `refresh_token`, `token_uri`, `client_id`, `client_secret`, `scopes`, `expiry`, `user_id`;
  - `google_user`:
    - `google_id`, `name`, `email`, `profile_pic`;
  - `google_task`:
    - `task_name`, `date`, `status`, `user_id`;
- ML state:
  - `ml_labels`:
    - `label_id`, `random_forest`, `user_id`;
  - `ml_features`:
    - `feature`, `user_id`.

Practical conclusion:

- `gmailsorter` is a compact sidecar, not a mailbox-native durable store;
- it keeps enough SQL structure to separate messages, labels, participants, OAuth state, tasks, and serialized ML artifacts;
- this is the clearest local-DB reference for an early OpenClaw classifier sidecar before a larger `inbox-zero`-style schema becomes necessary.

## Quantitative Assessment Appendix

### Evaluation Signals

- Maturity: project age/structure/docs + issue handling + ecosystem usage signals.
- Liveness: recent push/update activity.
- Community/Adoption: stars/forks (GitHub snapshot), issue activity.

### Quantitative Assessment Method

Use coarse `1-10` scores. The aim is comparability and tunable prioritization, not fake precision.

#### Core measures

- `Lang`: language preference for likely OpenClaw-side reuse.
  - Python `10`
  - C `9`
  - C++ `8`
  - Rust `7`
  - TypeScript `6`
  - JavaScript `5`
  - Go `4`
  - Ruby `3`
  - other `1-2`
- `License`: reuse friendliness, not just license existence.
  - permissive with clear license file: `9-10`
  - copyleft with clear license file: `3-5`
  - unclear or conflicting: `1-2`
- `Project`: maturity, docs, release discipline, contributor depth, and visible maintenance health.
- `Fetch`: usefulness for ingesting or mirroring mail into a local working store, including IMAP/POP coverage, OAuth/OAuth2 support where needed, and Maildir write path.
- `Display`: usefulness for reading, browsing, or presenting mail from a local or remote store.
- `Send`: ability to reply, forward, or send mail, not just fetch it.
- `GmailFlags`: how well the tool preserves or acts on Gmail-visible flags and status such as seen/unseen, starred, deleted, spam, or draft-like states.
- `GmailMeta`: how well it preserves Gmail-specific metadata such as labels, thread ids, history-like state, or message ids.
- `GmailDirs`: how well it models Gmail folder or directory semantics such as `All Mail`, `Spam`, `Trash`, `Sent Mail`, or explicit alias mappings.
- `Outlook`: explicit first-party Outlook or Office 365 support.
- `Yahoo`: explicit first-party Yahoo support. If absent, document that absence rather than upgrading generic IMAP plausibility.
- `Hooks`: curation/prioritization support during fetch, storage, or presentation, including rules, ML, LLM, and action hooks.
- `State`: clarity and usefulness of the local state model: Maildir, database, cache, schema, or sidecar structure.

#### Default combined score

Default score emphasizes likely OpenClaw reuse:

- `0.10*Lang + 0.12*License + 0.12*Project + 0.18*Fetch + 0.08*Display + 0.06*Send + 0.06*GmailFlags + 0.08*GmailMeta + 0.06*GmailDirs + 0.05*Outlook + 0.03*Yahoo + 0.03*Hooks + 0.03*State`

#### Scenario weight presets

Tune the weights instead of changing the raw scores.

- `mirror_fetch`
  - prioritize `Fetch`, `GmailFlags`, `GmailMeta`, `GmailDirs`, `Outlook`, `Yahoo`, `State`, `Project`
- `read_present`
  - prioritize `Display`, `Send`, `Fetch`, `Project`, `License`
- `fetch_and_send`
  - prioritize `Fetch`, `Send`, `Display`, `Outlook`, `Project`, `License`
- `openclaw_sidecar`
  - prioritize `Hooks`, `Fetch`, `GmailMeta`, `GmailDirs`, `State`, `License`, `Lang`
- `multi_provider`
  - prioritize `Outlook`, `Yahoo`, `Fetch`, `Project`, `License`

Example weight block:

```yaml
weights:
  Lang: 0.10
  License: 0.14
  Project: 0.12
  Fetch: 0.18
  Display: 0.06
  Send: 0.04
  GmailFlags: 0.06
  GmailMeta: 0.10
  GmailDirs: 0.06
  Outlook: 0.08
  Yahoo: 0.02
  Hooks: 0.04
  State: 0.02
```

### Capability Matrix and Default Scores

Scores are coarse `1-10` values. `Outlook` and `Yahoo` reflect explicit first-party support or examples, not just generic IMAP plausibility.

| Repo | Gmail / Outlook / Yahoo | Lang | License | Project | Fetch | Display | Send | GmailFlags | GmailMeta | GmailDirs | Outlook | Yahoo | Hooks | State | Default |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `gogcli` | Gmail explicit / Outlook not documented / Yahoo not documented | 4 | 10 | 8 | 7 | 2 | 3 | 6 | 10 | 7 | 1 | 1 | 9 | 5 | 6.2 |
| `himalaya` | Gmail explicit / Outlook explicit / Yahoo not documented | 7 | 10 | 9 | 7 | 10 | 9 | 4 | 3 | 8 | 9 | 1 | 4 | 6 | 6.8 |
| `email-oauth2-proxy` | Gmail explicit / Outlook explicit / Yahoo explicit with client-registration caveat | 10 | 10 | 8 | 6 | 1 | 4 | 1 | 1 | 1 | 10 | 9 | 2 | 3 | 5.2 |
| `inbox-zero` | Gmail primary / Outlook present in test flows / Yahoo not documented | 6 | 3 | 9 | 7 | 8 | 8 | 7 | 9 | 4 | 6 | 1 | 10 | 9 | 6.7 |
| `gmailsorter` | Gmail only / Outlook not documented / Yahoo not documented | 10 | 10 | 6 | 6 | 3 | 1 | 3 | 8 | 2 | 1 | 1 | 8 | 8 | 5.9 |
| `getmail6` | Gmail explicit / Office 365 and Hotmail explicit / Yahoo not documented | 10 | 4 | 8 | 9 | 1 | 1 | 4 | 7 | 4 | 8 | 1 | 3 | 5 | 5.8 |
| `offlineimap3` | Gmail explicit / Office 365 mentioned / Yahoo not documented | 10 | 4 | 7 | 9 | 1 | 1 | 6 | 10 | 8 | 5 | 1 | 2 | 7 | 6.1 |
| `neverest` | Gmail explicit / Outlook explicit / Yahoo not documented | 7 | 10 | 6 | 9 | 2 | 1 | 4 | 4 | 8 | 9 | 1 | 3 | 8 | 6.1 |
| `isync` / `mbsync` | Generic IMAP / Outlook not documented / Yahoo not documented | 9 | 4 | 4 | 8 | 1 | 1 | 4 | 2 | 6 | 1 | 1 | 1 | 7 | 4.8 |
| `hoardy-mail` | Gmail explicit / Hotmail explicit / Yahoo explicit | 10 | 3 | 6 | 9 | 1 | 1 | 7 | 3 | 8 | 4 | 10 | 3 | 6 | 6.0 |
| `cloud_mdir_sync` | Gmail explicit / Outlook explicit / Yahoo not documented | 10 | 4 | 6 | 8 | 3 | 6 | 5 | 5 | 6 | 9 | 1 | 4 | 7 | 6.0 |
| `notmuch` | Local Maildir/MH store only / Outlook not applicable / Yahoo not applicable | 9 | 3 | 8 | 1 | 8 | 1 | 2 | 2 | 5 | 1 | 1 | 5 | 8 | 4.2 |
| `dovecot` | Generic mail store/server / Outlook not documented / Yahoo not documented | 9 | 7 | 10 | 4 | 2 | 3 | 3 | 1 | 8 | 1 | 1 | 2 | 9 | 5.2 |
| `mutt` | Generic IMAP and Maildir / Outlook not documented / Yahoo not documented | 9 | 4 | 8 | 3 | 9 | 8 | 4 | 2 | 7 | 1 | 1 | 2 | 6 | 5.2 |
| `emailgenius` | Gmail only / Outlook only as comparison / Yahoo not documented | 10 | 10 | 3 | 5 | 4 | 1 | 2 | 5 | 1 | 1 | 1 | 6 | 4 | 4.9 |
| `MailSift-AI` | Gmail and Outlook named conceptually / Yahoo not documented | 10 | 8 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 3 | 1 | 6 | 2 | 3.0 |
| `gmailLoader` | Gmail only / Outlook not documented / Yahoo not documented | 5 | 2 | 2 | 6 | 5 | 1 | 1 | 7 | 1 | 1 | 1 | 5 | 3 | 3.9 |
| `clearmail` | Gmail only / Outlook not documented / Yahoo not documented | 5 | 2 | 2 | 5 | 3 | 1 | 5 | 2 | 4 | 1 | 1 | 7 | 2 | 3.4 |

Interpretation:

- `8-10`: strong first-choice candidates for the scored scenario.
- `6-7.9`: useful building blocks with clear caveats.
- `4-5.9`: selective pattern sources or sidecars.
- `< 4`: reference material only.

## State, Schema, and Hook Notes

Only a few of these repos expose durable local state in a way that matters for OpenClaw design. Those findings are important even if OpenClaw ultimately chooses a different database or storage engine, because they show what entities and relations repeatedly matter.

| Repo | State / Database | What Is Known |
|---|---|---|
| `inbox-zero` | PostgreSQL + Redis | Prisma schema is explicit and large. It models: identities (`User`, `Account`, `EmailAccount`); provider/watch state (`watchEmailsExpirationDate`, `watchEmailsSubscriptionId`, `lastSyncedHistoryId`); taxonomy (`Label`, `Category`, `Group`, `Newsletter`, `ColdEmail`); rules and actions (`Rule`, `Action`, `RuleHistory`, `ExecutedRule`, `ExecutedAction`, `ScheduledAction`); content tracking (`EmailMessage`, `ThreadTracker`, `ResponseTime`); digesting and cleanup (`Digest`, `DigestItem`, `CleanupJob`, `CleanupThread`); collaboration and side channels (`MessagingChannel`, org/member models); and storage/filing (`Knowledge`, `FilingFolder`, `DocumentFiling`). This is the strongest reference for a sidecar schema that separates account state, message state, taxonomy, decisions, and action history. |
| `gmailsorter` | SQLAlchemy; default SQLite, other SQL backends supported | Docs explicitly say it uses a local SQLite `email.db` by default. Visible tables include `email_content`, `email_threads`, `email_labels`, `email_from`, `email_to`, `email_cc`, `google_token`, `ml_labels`, and `ml_features`. The shape is useful because it separates raw message identity/content from thread membership, labels, participants, OAuth token state, and stored serialized ML models. It also tracks deleted state and supports label updates over time. |
| `offlineimap3` | SQLite local status cache + Maildir | Docs and changelog mention a sqlite cache in `LocalStatus-sqlite`. This is not an application schema; it is sync bookkeeping. Still useful as a reference for a thin sidecar layer that stores mailbox sync state separately from message bodies in Maildir. |
| `emailgenius` | JSON files, pandas DataFrames | Reads IMAP mail, writes JSON output, and uses in-memory/dataframe processing. The visible shape is message-centric: sender, subject, message id, and chosen label. No formal durable schema, but it does show a minimal staging shape for interactive review. |
| `MailSift-AI` | JSON samples and feedback files | Ships JSON sample data and user feedback files, not a real application database. |
| `gmailLoader` | No visible durable DB | Appears to operate directly on Gmail API data in app memory; visible message objects include `threadId`, so it is a reminder that thread-level identifiers matter even in lightweight fetch/display tools. |
| `clearmail` | No visible durable DB | Operates directly on IMAP fetch/classify/move flow without a visible schema. |
| `gogcli` | Config, client credentials, provider history/watch state, keyring-backed tokens | Gmail-native CLI and event bridge. Useful not as a generic mailbox schema, but as a reference for provider change feeds, watch lifecycle, webhook payload shape, and credential-storage patterns. |
| `himalaya` | Maildir / Notmuch / config-driven state | No app database visible in this repo; state lives in configured backends. |
| `neverest` | Maildir / Notmuch / config-driven sync state | Uses backend configs and local mailbox state rather than an app database. |
| `getmail6` | Maildir / mbox delivery | Delivery-oriented local store, not a visible application database. |
| `isync` / `mbsync` | Local mailbox pair state files | README describes simple local text state files per mailbox pair. |
| `notmuch` | Xapian index over Maildir or MH store | Keeps message bodies in the mail store and builds a separate index/tag database for search and threading. Strong reference for separating local message files from searchable metadata and tag state. |
| `dovecot` | Mail storage + server metadata files | Strong reference for Maildir correctness, UID handling, keyword mapping, and server-side mailbox metadata. More useful as a storage-semantics reference than as an OpenClaw sidecar schema. |
| `mutt` | Client state plus mailbox store | Primarily a mailbox client. Useful for display/search/sort behavior over Maildir or IMAP, but not a strong application-schema reference. |
| `email-oauth2-proxy` | Config and token/proxy state | Authentication bridge; no broad application schema in the repo. |
| `cloud_mdir_sync` | Maildir + config + cloud mailbox mapping state | Sync daemon centered on a configured Maildir target. It does not expose a broad app database, but it is a useful reference for an API-native mirror that also monitors local Maildir changes and uploads them back to the cloud. |
| `hoardy-mail` | Maildir or external MDA delivery | No application database; state is the local Maildir or downstream MDA target plus the IMAP batch operations requested at invocation time. Useful as a fetch-and-expire workflow reference, not as a schema reference. |

### Data Model Signals Across Repos

Across the repos that do expose durable local structure, the recurring information domains are:

- account and provider identity
- auth and token state
- sync cursor or watch state
- message identity
- thread or conversation identity
- folder, label, or category mapping
- sender and recipient participation
- message flags and status
- action and rule history
- digest or summary output
- scheduled follow-up or delayed actions

The important lesson at this level is not "use PostgreSQL" or "use SQLite". It is that message bodies, provider metadata, sync state, and action history repeatedly appear as separate concerns, even when a project stores them in one physical database.

Exact canonical field definitions, entity relationships, and integration-specific partitioning belong in the dedicated email design documents under the OpenClaw docs set, not in this repo inventory.

## External Lead: Yahoo to Maildir

Current local repos now include one strong explicit Yahoo -> Maildir lead:

| Repo | Language | Why It Matters | Caveat |
|---|---|---|---|
| `hoardy-mail` | Python | Explicitly documents fetching and backing up mail from `GMail, Yahoo, Hotmail, Yandex, etc` into Maildir or an MDA path. Strongest direct Yahoo -> Maildir implementation found in this pass. | GPL-3.0, small project, direct code reuse not appropriate. |

Useful public signals:

- GitHub repo: `Own-Data-Privateer/hoardy-mail`
- 15 stars / 1 fork / 0 open issues
- latest release `v2.6.1`
- pushed 2025-10-09

## Curation and Prioritization Hook Timing

This matters because OpenClaw can attach policy at different phases: during fetch, while writing to local state, after local state exists, or only when presenting mail.

| Repo | Main Hook Timing | What It Means |
|---|---|---|
| `inbox-zero` | After Gmail fetch, before action | Strongest visible policy/action layer: classify, label, archive, draft, reply, and route after messages are fetched from Gmail API. |
| `gmailsorter` | Between local database update and presentation | Learns from Gmail labels, stores local state, retrains, then predicts labels for new messages. Good pattern for a sidecar worker over a local store. |
| `clearmail` | During fetch and move | Fetches unseen IMAP mail, classifies immediately, then flags or moves messages. |
| `gmailLoader` | During get and display | Fetches Gmail API messages, then classifies them in app flow for immediate display. |
| `MailSift-AI` | Classification only | Model/pipeline concept, not a full mailbox hook implementation. |
| `offlineimap3` | No curation hook; sync only | Best used to preserve Gmail semantics into Maildir, then let OpenClaw or another worker classify later. |
| `getmail6` | No curation hook; ingress only | Fetches and delivers. Classification belongs in a downstream stage. |
| `neverest` | No curation hook; mirror/backup only | Mirror first, policy later. |
| `isync` / `mbsync` | No curation hook; sync only | Lightweight transport, not a policy layer. |
| `himalaya` | Mostly at read/manage time | Good for user-driven display and disposition after mail already exists in Maildir or IMAP. |
| `notmuch` | During local query and tag operations | Strong local search/tag layer after mail already exists in the store. Useful for read-side prioritization experiments, not fetch-time policy. |
| `dovecot` | No curation hook; store/server semantics only | Strong operational reference for mailbox storage behavior, not for prioritization. |
| `mutt` | During display and manual mailbox operations | Strong client-side read/sort/search interaction, but not an arrival-time automation layer. |
| `email-oauth2-proxy` | Before fetch/auth only | Authentication bridge, not a triage layer. |

## Local Repo List (Quick Inventory)

There are 18 non-archival Git repositories in this directory. Sixteen are clean upstream clones at their tracked branch tips. None has locally authored commits; the only dirty states are a Himalaya build override and incidental Neverest metadata.

| Class | Repositories | Local disposition |
|---|---|---|
| Core working shelf | `himalaya`, `neverest`, `gogcli` | Retain for the Pimalaya and Gmail integration path. |
| Product and classifier references | `gmailsorter`, `inbox-zero`, `email-oauth2-proxy`, `MailSift-AI` | Retain while implementation comparison is active; otherwise clean and replaceable. |
| Local-store and sync references | `notmuch`, `isync`, `offlineimap3`, `getmail6`, `dovecot`, `mutt`, `cloud_mdir_sync`, `hoardy-mail` | Architecture/reference value only; remove and reclone for focused review. |
| Lower-priority prototypes | `clearmail`, `emailgenius`, `gmailLoader` | Clean small clones; safe individual cleanup candidates. |

Dirty-state handling:

- `himalaya/rust-toolchain.toml` changes Rust `1.82.0` to `1.90.0`. Preserve it as an explicit local build patch only if a current build still requires it; do not lose it through bulk clone replacement.
- `neverest/.DS_Store` is the only local difference. Remove it and rely on a global macOS ignore; the source clone is otherwise replaceable.

`inbox-zero` is the largest clean clone here at about 129 MB. Most other repositories are small enough that cleanup should be driven by attention and relevance rather than space alone.

## Documentation Boundary and Placement Rules

This file should remain the broad email ecosystem inventory and reference notebook for:

- standards and protocol expectations;
- products and OSS projects;
- per-repo history, trajectory, adoption, feature surface, build/install shape, and code overview;
- broader opportunities for integration coverage, feature expansion, and realistic use cases across email services.

Detailed integration design and implementation planning should stay outside this file.

This file should not carry:

- modification or integration planning;
- task lists, sequencing, or implementation justifications;
- canonical field catalogs or entity relationship rules for a specific integrator;
- adapter contracts, validation plans, or implementation choices for a specific codebase.

Use the following placement rules when expanding this file:

- Add `gogcli`, `himalaya`, `neverest`, and other major repos here as first-class entries for project history, adoption signals, install/build shape, feature surface, code overview, and ecosystem fit.
- Expand standards coverage here when it improves repo evaluation:
  - SMTP transport;
  - POP3 retrieval limits;
  - IMAP mailbox and flag semantics;
  - RFC 5322 header identity and threading fields;
  - MIME parts, attachments, and body structure;
  - Maildir naming, flags, and folder conventions.
- Keep realistic use cases, provider/storage/watch/search/action opportunity gaps, and broader integration possibilities here, but not implementation plans for a specific integrator.
- Keep local operational findings here only when they materially affect repo evaluation.
  - Example: `gogcli` using Keychain or file-backed secret storage is relevant here.
- When a finding becomes:
  - a canonical field definition,
  - an entity relationship rule,
  - an adapter contract,
  - a test plan,
  - or an implementation choice,
  keep only the repo-level implication here and leave the detailed planning material outside this file.
- Do not add backlinks from this file into the OpenClaw-maintained email docs.
