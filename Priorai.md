# Priorai: Message Relevance and Prioritization

Temporary working name only. Final branding remains open.

## 1. Purpose

This document defines the personalized relevance, prioritization, blocking, and surfacing system as its own product and implementation track.

It is:

- not OpenClaw-specific;
- not email-only;
- the place for product opportunity, module design, UX, evaluation, and implementation direction for message relevance.

It should absorb:

- product opportunity and PMF framing;
- naming and branding notes;
- target audiences and market segments;
- signal models;
- scoring models;
- blocking and prioritization logic;
- UX and feedback loops;
- MVP and evaluation logic;
- references back to `Email.md` for the first substrate and proving ground.

## 2. Core Thesis

Static filtering is useful but insufficient.

The stronger thesis is:

- combine ML-oriented learning from behavior with LLM-oriented interpretation of user language and explanations;
- optimize for effectiveness and efficiency, not engagement;
- let users shape the system in their own words and through their own actions;
- keep results inspectable, editable, and reversible.

The innovative part is not just "use an LLM".

It is:

- human-driven reinforcement;
- multi-dimensional scoring;
- explicit and implicit feedback capture;
- contextual mode switching;
- natural-language preference capture compiled into structured policy.

## 3. Problem and Opportunity

Users are overloaded by streams where:

- important items are mixed with noise;
- relevance is contextual and time-dependent;
- rules drift and require maintenance;
- provider heuristics are opaque;
- the same person needs different ranking behavior at different times.

The opportunity is to reduce:

- reading volume;
- missed important items;
- manual filtering effort;
- friction between user intent and automation behavior.

The product should optimize for:

- less reading to achieve the same or better outcomes;
- lower missed-important-item rate;
- faster time to useful review;
- clearer reasons for why something was shown;
- better user control without constant rule maintenance.

## 4. Target Users and Early Segments

Most plausible early segments:

1. High-agency individual operators
   - founders
   - consultants
   - investors
   - senior ICs
   - technically fluent executives

2. Small teams with shared operational load
   - founders plus chiefs of staff
   - support or success leads
   - sales and operations pods

3. Technical self-hosters and power users
   - users willing to connect multiple accounts and tools
   - users comfortable with local mirrors, logs, and inspectable configuration

Lower-priority later segments:

- large enterprise support teams
- compliance-heavy organizations
- casual consumers

## 5. Value Proposition

For high-agency individuals:

- less reading
- fewer misses
- better timing

For small teams:

- clearer routing
- better ownership
- lower response drag

For technical self-hosters:

- transparency
- inspectable policy
- local control
- portability

## 6. Signal Families

## 6.1. Implicit positive signals

- reply
- forward
- star or equivalent strong-save action
- manual move into a high-priority or keep bucket
- open plus meaningful dwell time
- repeated return visits
- manual rescue from spam, archive, or bulk buckets

## 6.2. Implicit negative signals

- mark as spam
- delete
- archive without meaningful interaction
- repeated ignore across similar items
- collapse or suppress a category

Important caution:

- non-action is weak evidence, not strong evidence
- no-click or no-open can mean:
  - irrelevant
  - already known
  - too busy
  - seen elsewhere
  - preview-only consumption

## 6.3. Explicit structured feedback

- relevant / not relevant
- urgent / not urgent
- needs follow-up
- wrong category
- work
- billing
- friends
- newsletters
- noise
- show more like this
- show less like this

## 6.4. Explicit verbal feedback

Examples:

- "messages every day"
- "need to review before paying"
- "show work-related first, but only between 8am and 6pm"
- "during vacation only show work if it mentions outage, payroll, or legal"
- "receipts are low priority unless over $500"

These should not remain raw comments at runtime.

They should be interpreted into structured policy:

- weights
- thresholds
- categories
- time-window boosts
- action gates
- exception rules
- explanation snippets

## 6.5. Contextual mode signals

- time of day
- day of week
- holidays
- travel
- workday versus evening
- vacation mode
- quarter close / billing windows / tax season
- user-selected mode changes

## 7. Score Dimensions

One score is too crude.

Candidate dimensions:

- relevance
- urgency
- follow-up need
- trust/risk
- category:
  - work
  - billing
  - friends
  - marketing
  - newsletter
  - notification
  - receipt
  - other
- digestability:
  - show now
  - digest later
  - suppress by default
- ownership:
  - me
  - team
  - no owner yet

Derived views can include:

- work now
- needs reply
- review before paying
- rescue from spam or bulk
- low-attention digest
- after-hours personal
- vacation exceptions

## 8. Blocking Versus Prioritization

These should remain distinct.

Blocking or suppression should use conservative high-confidence signals:

- explicit spam or junk placement
- strong auth failure patterns
- phishing or malware indicators
- very poor reputation
- strong user-negative feedback

Prioritization should use broader evidence:

- sender familiarity
- thread history
- reply probability
- explicit asks
- category
- timing context
- provider metadata such as Gmail labels or categories where available
- learned user preferences
- free-text policy

Important class distinction:

- true spam
- bulk but legitimate
- bulk but wanted
- low-priority but useful later
- important now

## 9. Requirements

Functional:

- ingest one or more message streams through an existing fetch and display boundary
- normalize messages or events into a stable sidecar identity model
- rank and classify along multiple dimensions, not only one label
- accept natural-language preferences and convert them into structured policy
- support different modes by time, day, context, and user state
- preserve auditability of why a message was shown, suppressed, or re-ranked

Non-functional:

- low-friction feedback capture
- reversible actions
- explainability for ranking and suppression
- privacy-aware local or user-controlled state where possible
- architecture that can start narrow and widen without rewrite

## 10. Architecture

## 10.1. Layered decision engine

1. deterministic safety and routing rules
2. lightweight learned ranking and classification
3. LLM interpretation for:
   - natural-language policy
   - ambiguous residual cases
   - explanations
   - policy compilation suggestions

## 10.2. Sidecar requirements

The module requires durable sidecar state for:

- message or event identity
- conversation or thread identity
- participants
- source metadata
- raw and normalized labels or categories
- per-dimension scores
- evidence and explanation traces
- explicit feedback
- compiled policy from verbal feedback
- contextual modes
- action history
- miss proxies and rescue events

## 10.3. Presentation layer

The presentation layer should support:

- ranked list views
- filtered queues
- explanation affordances
- lightweight feedback controls
- replay and evaluation against historical streams

## 11. Connection To Email

Email is the first implementation path because it offers:

- the strongest immediate pain
- rich implicit and explicit signals
- replayable historical data
- strong substrate options for local mirroring and sidecar evaluation

Canonical substrate reference:

- `Email.md` §5
  - solution thesis, benefits, and PMF for the email vertical
- `Email.md` §7
  - architecture and design direction for email-specific decisions
- `Email.md` §9.1 through §9.6
  - Gmail-native, IMAP-first, hybrid, rollout, AR processing model, and Gmail-versus-Maildir boundary choices
- `Email.md` §10.3.2 through §10.3.7
  - `notmuch`, Pimalaya, ORM posture, canonical substrate summary, anti-spam signal families, and definitive schema references
- `Email.md` §11 through §14
  - OSS and commercial landscape, maturity, and implementation readiness

This module should treat that substrate as mostly opaque:

- fetch and mirror happen below
- scoring, policy, explanation, and feedback happen above

## 12. UX Direction

The UX must do two jobs:

- help the user make better decisions immediately
- produce good training and policy-shaping data

That suggests:

- list-level lightweight actions
- message-level richer feedback
- free-text preference capture
- visible explanation of why an item surfaced

The key PMF learning loop is:

- user sees item
- user gives minimal feedback
- system adjusts future behavior
- user notices it got better

## 13. MVP and Evaluation

The narrowest credible MVP is:

- one high-value stream first
- adaptive ranked list
- a handful of dimensions
- immediate feedback controls
- natural-language preference capture
- explanation panel
- replay and backtest over recent history

Most likely MVP shape:

- email-first
- focus on:
  - relevance
  - urgency
  - follow-up
  - category
- support:
  - thumbs-up/down or equivalent quick feedback
  - star, reply, delete, spam as implicit signals
  - short preference comments
  - time-based modes
  - digest versus surface-now decisions

Evaluation metrics:

- reduced reading burden
- missed-important-item proxies:
  - wish I saw this earlier
  - too late
  - manual rescue from archive, bulk, or spam
  - delayed opens or replies after missed surfacing
- ranking improvement after feedback
- explanation usefulness
- whether users ask to add more streams after finding the first one useful

## 14. Naming and Branding

The naming search should not start from email.
It should start from the broader job:

- reduce overload
- surface what matters
- help people act sooner with less reading
- work across email, chats, DMs, issues, PRs, logs, changelogs, and other message streams

Working criteria:

- not email-specific
- works for professional and personal message streams
- feels like infrastructure or capability, not only personality
- can support a future product family
- does not require explaining a metaphor before the value is clear

Current working name:

- `Priorai`

## Appendix A. Generic Product Method

This appendix holds the generic product-method material so it does not need a separate top-level file.

### A.1. Presentation structure

For presentation and internal narrative, the cleanest structure is:

1. problem and pain
2. target users and segments
3. value proposition
4. product thesis
5. product shape
6. proof path
7. MVP

### A.2. Generic PMF questions

- Which users feel the pain most sharply?
- Which signals are strongest and least ambiguous?
- Which feedback controls are acceptable without fatigue?
- Which explanations increase trust rather than noise?
- Which stream validates the product fastest?

### A.3. Broader market frame

The broader product thesis is:

- a user-shaped adaptive relevance layer across message streams.
