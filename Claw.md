# OpenClaw Strategy and Overview

## Purpose

This is the central OpenClaw document for this workspace.

It should help a reader answer three questions quickly:

1. Why is `OpenClaw` still the runtime base?
2. What does it already solve well enough?
3. What still has to be built around it for our actual goals?

It is not a code reference and it is not an execution checklist.

## OpenClaw Document Map

The OpenClaw-specific set should stay compact:

- `Claw.md`
  - top-down strategy, scope, and conclusions
- `ClawPlan.md`
  - active OpenClaw work: configure, test, expand, harden, integrate
- `ClawCode.md`
  - implementation reference for developers actively modifying or validating the codebase
- `Claws.md`
  - alternatives, forks, and adjacent products
- `Email.md`
  - email substrate and the first deep technical vertical

Document-linking rule for this set:

- `Claw.md` is the only place that should act as the OpenClaw document map.
- `ClawPlan.md` and `ClawCode.md` should not link to `Claw.md` or to each other just for navigation.
- Specific external references, upstream docs, and section-level citations are welcome wherever they materially improve clarity.

## What OpenClaw Is In This Project

In this project, `OpenClaw` is best treated as:

- control plane
- operator runtime
- multi-channel surface
- tool and agent boundary
- place where fetch, display, and action flows can be exposed

It is not:

- the canonical message store
- the full prioritization system
- the whole product

That distinction matters. The real differentiation we are pursuing sits above the raw channels and below the top-level user interaction surfaces.

## Why OpenClaw Remains The Base

The hard work ahead is not choosing a different assistant shell.

The hard work is:

- durable ingestion
- replay and reprocessing
- local state and sidecar design
- controlled display and action boundaries
- evaluation of prioritization, blocking, and surfacing quality

That work would still exist if the runtime shell changed.

`OpenClaw` remains the better base for the next several iterations because it already provides:

- broad channel reach
- remote operation
- agent and session control
- native `MCP`
- deep `ACP`
- a codebase, runtime, and local environment we are already validating
- a clear upstream security and hardening story grounded in gateway auth, trusted-proxy guidance, sandboxing, and `openclaw security audit`

The project therefore gains more by building the missing substrate and state layers around OpenClaw than by switching runtime families early.

## What OpenClaw Already Solves Well

For our purposes, OpenClaw is already strong in the following areas:

- runtime and channel surface
- gateway and operator workflows
- protocol reach through `MCP`
- remote and delegated execution through `ACP`
- exposure of capabilities to multiple communication surfaces

This means we do not need another runtime in order to gain:

- protocol plumbing
- channel reach
- agent dispatch
- remote control

Those are already present.

## Where OpenClaw Is Weak For Our Interests

The main gaps are not at the top of the stack.

They are in deeper communication state:

- deep email handling
- durable replayable message history
- richer mailbox-native display and reprocessing
- first-class local sidecar state
- policy, classification, and audit layers over message streams

This is why email became the first deep vertical.
It forces a concrete answer to the real missing layer:

- message substrate
- replay and local history
- sidecar state
- display/action boundary design

## Strategic Implication

The structural conclusion is now straightforward:

- `OpenClaw` should remain the runtime shell
- deeper message-state and decision systems should attach around it
- the project should avoid trying to turn OpenClaw itself into a full mail engine or full relevance engine

That is the reason for separating concerns:

- `OpenClaw` for runtime, channels, tools, and control surfaces
- `Email.md` for substrate and message-handling investigation
- a separate relevance and prioritization module outside the OpenClaw document set

## Alternatives And What They Contribute

The alternatives are no longer blocking the runtime choice. They are reference sources.

`Hermes`

- useful for:
  - direct email posture
  - memory layering
  - Honcho-backed user modeling
  - personal-agent coherence

`DenchClaw`

- useful for:
  - structured workspace state
  - CRM, documents, and reports
  - sidecar and DuckDB-like product thinking

`NanoClaw` and `NemoClaw`

- useful for:
  - security critique
  - sandboxing and containment posture
  - deployment hardening ideas

`Paperclip`

- useful as a layer above the runtime:
  - orchestration
  - governance
  - multi-agent management

`gstack`

- useful as process and methodology:
  - review discipline
  - structured development flow
  - operational rigor around agent work

Detailed product treatment belongs in `Claws.md`.

## OpenClaw-Specific Technical Implications

OpenClaw already has real `MCP` and `ACP` support.

So the missing layer for this project is not more protocol wiring.
The missing layer is:

- message substrate
- replay and local history
- sidecar state
- richer display and action boundaries

That matters because it narrows the implementation question.
The next useful work is not "make OpenClaw speak more protocols".
It is "build better state and decision layers around the runtime we already have".

Implementation facts, runtime behavior, and code-facing details belong in `ClawCode.md`.

## Current Conclusion

For the next several iterations, `OpenClaw` should be treated as the enduring control-plane base.

The project should proceed as if the following are settled:

1. OpenClaw remains the runtime base.
2. Email is the first deep technical vertical.
3. Durable substrate plus sidecar state is required.
4. The relevance and prioritization layer should be built around fetch and display boundaries, not by forcing OpenClaw to become the whole stack.
