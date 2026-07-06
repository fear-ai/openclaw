# Adaptive Relevance Blueprint

Updated: 2026-03-12

## Lead-in

This blueprint is about information accessibility.  
Not access in the legal sense. Access in the cognitive sense.

People can technically reach more content than ever. Yet useful signal is still hard to reach quickly, verify, and act on. The gap is not supply. The gap is relevance, trust, and control.

The operating thesis:

- relevance quality is the product
- trust is the long-term differentiator
- user control is the stability mechanism

Working label:

- **Adaptive Relevance Intelligence (ARI)**

## Problem statement

Most systems now optimize for engagement traces. Users need decision-grade relevance. That mismatch creates persistent pain.

### The pain, in plain terms

Information arrives as fragments. The same development shows up as an issue, a PR, a changelog line, a post, and a commentary thread. People keep re-parsing the same event in different wrappers.

Feedback signals are weak. Clicks and likes say little about why something mattered. They blur urgency, trust, novelty, and practical usefulness.

Visibility creates its own gravity. What is shown gets feedback. What gets feedback is shown again. This is exposure bias in practice, and it systematically hides weak-but-important signals.

Monetization pressure complicates trust. Relevant offers can be useful and welcome, but opaque ranking and covert incentives destroy confidence over time.

### Populations affected

Readers and operators lose time and miss key events.  
Creators and providers struggle against visibility inertia.  
Curators lack transparent reward systems for quality work.  
Developers inherit noisy feedback loops and overfit-to-CTR pressure.

## Solution overview

Use events, not raw items, as the primary unit of attention.  
Use multi-axis user feedback, not single votes, as the primary training signal.  
Use progressive exposure so people can scan fast, then drill down only when needed.

This gives one system that works across software operations streams, policy/market watch workflows, and mixed personal/professional feeds.

## Progressive exposure model

Progressive exposure is the core accessibility strategy. Show the minimum needed first. Reveal depth on demand.

### Layer 1: glance

One line per event. Short title, trust hint, novelty, and impact cue.  
Goal: fast orientation and low cognitive load.

### Layer 2: context

Compact event card. Why this event is shown. What changed since last seen.  
Goal: quick judgment without opening five tabs.

### Layer 3: evidence

Item lineage and provenance. Issues, PRs, advisories, notes, and commentary grouped under one event.  
Goal: verification and confidence building.

### Layer 4: action

User rationale, tags, follow-ups, and task hooks.  
Goal: convert information into decisions and repeatable workflows.

## Methodology (algorithmic core)

### Data model

- **Item**: one source artifact (issue, PR, changelog line, article, post).
- **Event**: a deduplicated cluster of items describing one underlying development.
- **Feedback event**: explicit user reaction on an item/event, optionally with free-text rationale.

### Feedback language

Use separate dimensions so one signal does not overwrite another:

- `novelty`: `new | update | duplicate`
- `trust`: `verified | plausible | speculative`
- `impact`: `act_now | watch | ignore`
- `intent`: `biz | invest | learn | personal`
- `signal_quality`: `high_signal | noise`
- `tone`: `informative | analysis | hype | funny`

Critical rule:

- `duplicate` means "already seen in this event context."
- It does **not** mean "I do not care about this topic."

### Learning loop

1. Ingest heterogeneous sources.
2. Normalize into a canonical item schema.
3. Cluster into event timelines.
4. Rank events per user profile.
5. Attach concise "why shown" explanations.
6. Update preference models from explicit feedback, rationale text, and bounded implicit signals.

### Exposure bias handling

Treat exposure bias as a design input, not a cleanup task.

- Keep controlled exploration capacity.
- Log display position and exposure context.
- Apply exposure-aware weighting in updates.
- Track event recall and missed-signal rate, not click-only outcomes.
- Support pull-based retrieval to surface low-exposure niches.

## Interaction design

The interface exists to improve model quality and user trust. It is not decoration.

### CLI interaction

CLI should favor speed, muscle memory, and explicit correction:

- reaction shortcuts by dimension
- `:why <text>` to capture rationale
- `:dup <event_or_item_id>` to link duplicates
- `:tag +learn +act_now -noise` for expert edits

### GUI interaction

GUI should favor confidence and traceability:

- event cards as primary unit
- chip-based multi-axis reactions
- duplicate-link picker with nearest-event suggestions
- side-by-side raw item and event summary
- "why this is shown" panel with editable controls

## Trust, incentives, and governance

Trust depends on role clarity.

Reader control stays primary: inspectability, editability, exportability.  
Creator/provider reach should be relevance-driven, not pay-to-force visibility.  
Curators can add real value, but only with transparent identity, rationale standards, and compensation tied to quality and trust durability.  
Platform governance should separate ranking integrity from short-horizon monetization pressure.

## Privacy and storage

Default to local-first storage for preferences, reactions, and rationale history.  
Offer optional encrypted sync for continuity.  
Keep deletion/export simple.  
Support on-demand pull workflows where users prefer explicit retrieval over continuous push.

## Applicability and scope

Changelog/issue/PR triage is an immediate use case, not the conceptual center.  
The same method supports broader wayfinding needs across heterogeneous content domains.

## Delivery roadmap

### Phase 1: foundation and observability

Canonical item/event schemas, baseline clustering, multi-axis feedback capture, and exposure/rationale instrumentation.

### Phase 2: ranking and correction quality

Personalized event ranking, exposure-aware updates, duplicate-link UX improvements, and better explanation clarity.

### Phase 3: trust and ecosystem economics

Curator trust metrics, incentive policy hooks, stronger privacy-local defaults, and cross-domain adapters.

## Success criteria

Measure outcomes people can feel:

- lower perceived noise without reduced important-signal recall
- faster time-to-important-signal
- higher-quality explicit rationale usage
- lower duplicate frustration without topic blindness
- stable long-term trust scores for ranking and curation layers

## Research and development alignment

This blueprint sits at the intersection of:

- interactive information retrieval
- human-in-the-loop relevance feedback
- exposure-aware ranking and debiasing
- event detection and clustering
- explainable and controllable personalization
- trust-centered recommendation design

## Companion document

`Crusts.md` keeps the cultural exploration and origin narrative.  
This blueprint is the execution architecture.
