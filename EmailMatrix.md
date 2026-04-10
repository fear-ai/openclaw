# Email Compatibility And Mapping Matrix

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Scope](#2-scope)
- [3. Comparison Axes](#3-comparison-axes)
- [4. Information Element Concordance](#4-information-element-concordance)
  - [4.1. Identity and conversation](#41-identity-and-conversation)
  - [4.2. Placement and state](#42-placement-and-state)
  - [4.3. Content and provenance](#43-content-and-provenance)
  - [4.4. Sync and replay](#44-sync-and-replay)
- [5. Behavior Concordance](#5-behavior-concordance)
- [6. OpenClaw-Relevant Gaps](#6-openclaw-relevant-gaps)
- [7. Configuration And Credential Concordance](#7-configuration-and-credential-concordance)
  - [7.1. Standalone `gog`](#71-standalone-gog)
  - [7.2. OpenClaw using `gog`](#72-openclaw-using-gog)
  - [7.3. Himalaya and Neverest](#73-himalaya-and-neverest)
- [8. Reviewed Product Notes](#8-reviewed-product-notes)
  - [8.1. inbox-zero concordance](#81-inbox-zero-concordance)
  - [8.2. gmailsorter concordance](#82-gmailsorter-concordance)
  - [8.3. Hermes concordance](#83-hermes-concordance)
- [9. References](#9-references)

## 1. Purpose

This document compares real providers, libraries, tools, and reviewed projects against the canonical model defined in `EmailModel.md`.

It is meant to support:

- compatibility assessment;
- implementation decisions;
- mismatch and lossiness tracking;
- naming concordance across systems.

## 2. Scope

Current coverage focuses on the systems most relevant to the near-term design:

- standards-derived canonical model;
- Gmail and `gog`;
- Pimalaya libraries and the Himalaya/Neverest surfaces;
- current OpenClaw Gmail hook usage;
- initial notes on `inbox-zero` and `gmailsorter`.

## 3. Comparison Axes

Each element or behavior should be assessed along these axes:

- native name
- canonical name
- behavior match
- value-shape match
- relationship match
- information loss
- adaptation required

## 4. Information Element Concordance

### 4.1. Identity and conversation

| Canonical element | Gmail / `gog` | Pimalaya / Himalaya / Neverest | OpenClaw current usage | Notes |
| --- | --- | --- | --- | --- |
| `provider_message_id` | Gmail `id`; surfaced by `gog` watch payloads | not surfaced as a first-class generic mailbox concept | uses `messages[0].id` in default Gmail hook mapping | strong Gmail/provider identity, weak generic mailbox exposure |
| `internet_message_id` | raw header `Message-ID` if fetched | available through message/header surfaces, not as the primary sync identity | not used in current Gmail hook mapping | must remain distinct from provider ids |
| `provider_thread_id` | Gmail `threadId`; surfaced by `gog` watch payloads | local thread support exists, but not as Gmail-native thread id | not used in current default mapping | provider thread grouping and local conversation are not identical |
| `conversation_id` | not native; derived | local thread abstraction available | not present | product-owned normalized conversation id |
| `in_reply_to_message_id` | raw header when fetched | local message/header surfaces | not present | standards-derived |
| `references_message_ids` | raw headers when fetched | local message/header surfaces | not present | standards-derived |

### 4.2. Placement and state

| Canonical element | Gmail / `gog` | Pimalaya / Himalaya / Neverest | OpenClaw current usage | Notes |
| --- | --- | --- | --- | --- |
| `mailbox_memberships` | Gmail labels and special system labels; `gog` watch payload currently surfaces `labels` by name | folders and folder aliases | not modeled explicitly in the Gmail hook summary path | canonical neutral abstraction |
| `provider_label_id` | Gmail `labelIds`; richer than current `gog` watch summary labels | not applicable as a generic mailbox field | not used | preserve provider ids where available |
| `provider_label_name` | Gmail label display name or `gog` `labels[]` payload values | folder names and aliases | not used | useful immediately for chips, routing, and coarse prioritization |
| `mailbox_name` | derived from labels/categories if needed | first-class `folder` concept | not used | folder-first in Pimalaya |
| `is_read` | Gmail label/state projection | flag semantics supported and exposed | not used in current Gmail hook summary | normalize from provider or mailbox state |
| `is_answered` | provider or mailbox state when available | explicit flag support | not used | Himalaya reply flow sets answered state |
| `is_flagged` | provider label/state projection | explicit flag support | not used | separate from product scoring |
| `is_deleted` / `is_in_trash` | Gmail trash state and label placement | delete style may be folder or flag based | not used | do not collapse trash and suppression |

### 4.3. Content and provenance

| Canonical element | Gmail / `gog` | Pimalaya / Himalaya / Neverest | OpenClaw current usage | Notes |
| --- | --- | --- | --- | --- |
| `subject` | available in watch summaries and message fetch | available in envelope/message surfaces | uses `messages[0].subject` | aligned |
| `snippet` | Gmail-native `snippet`; surfaced by `gog` | not a standard mailbox-native abstraction | uses `messages[0].snippet` | provider summary, not canonical body |
| `body_text` | optional in watch payloads with `--include-body` | available through message fetch/read | uses `messages[0].body` if included | summary path may truncate |
| `body_is_partial` | `gog` `bodyTruncated` indicates partial body fetch | not a first-class mailbox field; may need derivation from fetch mode or part completeness | not used | needed to avoid over-trusting preview text |
| `from_address` / `from_display_name` | summarized sender fields | available in envelopes and messages | uses `messages[0].from` as a humanized summary field | current OpenClaw path may mix display name and address |
| `to_addresses` | available directly in `gog` watch payloads and in fetched message headers | available in messages and query filters | not used in current default mapping | needed for canonical participant model and direct-vs-list heuristics |
| `date_header_at` | `gog` watch payload surfaces `date`; Gmail message fetch exposes RFC `Date` header | available in message surfaces | not used in current hook mapping | standards-derived |
| `internal_received_at` | Gmail `internalDate` | no generic equivalent | not used | must remain provider-specific |
| auth and list headers | available only with fuller message/header fetch | available through message/header surfaces | not used | central to filtering and trust modeling |

### 4.4. Sync and replay

| Canonical element | Gmail / `gog` | Pimalaya / Himalaya / Neverest | OpenClaw current usage | Notes |
| --- | --- | --- | --- | --- |
| `provider_history_id` | top-level Gmail / `gog` `historyId`; central to watch/history flow | not a generic mailbox concept | implied by docs but not used in default mapping | provider mutation-sequence anchor |
| `sync_cursor` | Gmail history cursor or similar provider cursor | sync filters and backend-side state, but not provider-native history ids | not modeled | needed for replay and incremental processing |
| `source_change_type` | `gog` supports `messageAdded`, `messageDeleted`, `labelAdded`, `labelRemoved` history types | sync action semantics, not provider event taxonomy | not modeled | should be normalized by adapter |
| deletion-only change ids | `gog` top-level `deletedMessageIds` may appear without message summaries | sync tooling usually infers deletion from destination/source reconciliation | not modeled | adapters must preserve deletion events even without full message bodies |
| `store_locator` | Gmail resource locator or internal fetch reference | Maildir path / mailbox locator / backend context | not modeled | needed for durable replay and local mirrors |

## 5. Behavior Concordance

| Behavior | Gmail / `gog` | Himalaya / Neverest / Pimalaya | OpenClaw current usage | Adaptation note |
| --- | --- | --- | --- | --- |
| watch / incremental changes | strong provider-native history semantics | sync-oriented rather than provider-event-oriented | currently wake-trigger oriented | add canonical change-event adapter |
| stale history recovery | `gog` falls back to recent message listing and resets history anchor when Gmail history is stale | sync tools reconcile current mailbox state rather than using provider history ids | not modeled | document replay implications and preserve reset points |
| excluded-label filtering | `gog` excludes matching labels before hook forwarding; default excludes `SPAM` and `TRASH` | folder filters and sync rules exist, but not Gmail-style history filtering | not modeled | preserve exclusion policy separately from canonical source truth |
| read versus preview | provider-dependent | explicit read/preview distinction in Himalaya | not modeled in Gmail hook path | preserve as message-state-affecting action |
| reply sets answered | provider/state dependent | explicit reply path sets `Answered` | not modeled | map action event and resulting state separately |
| delete to trash vs mark deleted | provider-specific | explicit mailbox delete style options | not modeled | normalize into action plus resulting placement/state |
| partial body indication | `gog` sets `bodyTruncated` when body payload is incomplete | mailbox tools usually imply completeness from fetch mode or part selection | not modeled | preserve explicit partial-body knowledge in canonical content state |
| folder aliasing | provider and mailbox specific | first-class in Pimalaya configs | not relevant in current Gmail hook path | treat as mailbox-role mapping, not identity |

## 6. OpenClaw-Relevant Gaps

Current OpenClaw Gmail hook processing uses only a narrow summary projection:

- `messages[0].id`
- `messages[0].from`
- `messages[0].subject`
- `messages[0].snippet`
- `messages[0].body`

The verified `gog` watch payload surface is richer:

- top-level `historyId`
- top-level `deletedMessageIds`
- per-message `threadId`
- per-message `to`
- per-message `date`
- per-message `labels`
- per-message `bodyTruncated`

This leaves out major canonical domains:

- conversation and provider thread ids
- mailbox placement and provider labels
- message state
- provenance and authentication
- source change semantics
- explicit replay anchors
- partial-body knowledge

The adaptation path is therefore:

1. keep the current summary path for low-latency wake and display;
2. add a richer adapter for canonical field extraction;
3. persist provider-native ids and change anchors before deriving product state.

## 7. Configuration And Credential Concordance

### 7.1. Standalone `gog`

| Configuration or credential concern | `gog` native behavior | Notes |
| --- | --- | --- |
| Config root | macOS: `~/Library/Application Support/gogcli/`; Linux: `~/.config/gogcli/` or `$XDG_CONFIG_HOME/gogcli/` | verified from `gog config path` and `internal/config/paths.go` |
| OAuth client credentials | stored on disk as `credentials.json` for the default client or `credentials-<client>.json` for named clients | contains `client_id` and `client_secret`, not refresh tokens |
| Refresh token storage | stored in the selected keyring backend under keys like `token:<client>:<email>` | verified by `gog auth list` and `internal/secrets/store.go` |
| Installed auth CLI surface | `gog auth credentials set`, `gog auth add --readonly`, `gog auth tokens export`, `gog auth tokens import`, `gog auth keyring auto|keychain|file` | current installed CLI is `gog v0.9.0`; local instructions should follow this syntax rather than newer drifted examples |
| Default keyring mode | `auto` | current local state is `auto` |
| Keyring backend options | `auto`, `keychain`, `file` | `file` stores encrypted entries on disk under the `keyring/` directory |
| File-backend password source | `GOG_KEYRING_PASSWORD` | required for non-interactive file-backed runs |
| Service-account credentials | stored as `sa-<encoded-email>.json` in the config dir | takes precedence over OAuth refresh-token auth when configured |
| Watch state | stored separately under `state/gmail-watch` | no current local watch state was present |
| Current local secret inventory | Keychain refresh-token entries are present for `alphaeosnet@gmail.com`, `moonshotcol@gmail.com`, `wallyb33@gmail.com`, and `tearodactylus@gmail.com` | this reflects current local secret material, whether or not every account has already been revalidated by live mailbox commands |
| Portable token exports | per-account JSON exports include `client`, `email`, `created_at`, `refresh_token`, `services`, `scopes` | importable with `gog auth tokens import`; preferred over the older raw `gogcli_*.json` shape |
| Legacy raw token files | older `gogcli_*.json` files may contain only `created_at`, `refresh_token`, `services`, `scopes` | keep for archive/recovery, but prefer the newer export shape for restore |

Archival implications:

- exporting `gog` state requires both the config dir and the secret backend material;
- on macOS Keychain, the important refresh-token entries are outside the config dir;
- switching `gog` to the `file` backend produces a more portable archiveable tree, but changes the trust and password-management model.

### 7.2. OpenClaw using `gog`

| Configuration or credential concern | OpenClaw behavior | Notes |
| --- | --- | --- |
| Gmail account identity | stored as `hooks.gmail.account` | OpenClaw passes the selected account to `gog` |
| Gmail runtime settings | stored under `hooks.gmail.*` | includes topic, subscription, push token, hook token, hook URL, body inclusion, size cap, renew interval, and local serve settings |
| OAuth client credentials | not stored by OpenClaw | OpenClaw relies on standalone `gog` auth setup |
| Refresh tokens | not stored by OpenClaw | no separate Gmail credential store was found in current OpenClaw config |
| Current local config state | no email/Gmail/`gog`/Himalaya/Neverest keys in either `~/.openclaw/openclaw.json` or `~/.openclaw-repo/openclaw.json` | OpenClaw is not currently configured for Gmail on this machine |
| Credential duplication | none today | OpenClaw shells out to `gog` rather than mirroring Gmail auth state |

Adaptation implication:

- OpenClaw should treat `gog` auth state as an external dependency and keep its own config limited to hook/watch runtime state unless a deliberate credential-ownership change is made later.

### 7.3. Himalaya and Neverest

| Configuration or credential concern | Himalaya | Neverest | Notes |
| --- | --- | --- | --- |
| Primary role | mailbox client | backend-to-backend sync tool | complementary rather than interchangeable |
| Config structure | one account with mailbox + send backends | one account with `left` and `right` backends | not directly config-compatible |
| Shared account concepts | email/login, folder aliases, auth modes | email/login, folder aliases, auth modes | similar because both come from the Pimalaya ecosystem |
| Current local account inventory | `alphaeosnet`, `moonshotcol`, `wallyb33`, `tearodactylus` | same four accounts | broader than the current standalone `gog` account set |
| Current secret retrieval mode | `backend.auth.cmd` and send auth command using macOS `security find-generic-password` | `right.backend.auth.cmd` using macOS `security find-generic-password` | credentials are not stored inline today |
| Current local secret type | Gmail app passwords for IMAP and SMTP paths | mailbox password/app-password for the remote side | current local Himalaya usage is password-based, not OAuth2-based |
| Supported auth alternatives | `auth.raw`, `auth.cmd`, `auth.keyring`, OAuth2 variants including `oauthbearer` and `xoauth2` | `auth.raw`, `auth.cmd`, `auth.keyring`, OAuth2 variants | confirmed from the checked source/docs |
| OAuth2 secret surface | supports client/refresh/access-token style OAuth2 secrets and keyring-backed storage | supports OAuth2-capable backend auth configuration on the remote side | capability exists even though the local setup uses app passwords |
| Single-source maintenance viability | possible only via generation from a higher-level inventory | possible only via generation from a higher-level inventory | one shared hand-maintained `config.toml` is not realistic |

Operational conclusion:

- Himalaya and Neverest should be treated as two generated projections of one account inventory if unified maintenance is desired;
- the current machine state uses macOS Keychain indirectly via shell commands rather than via their built-in `keyring` modes.

## 8. Reviewed Product Notes

### 8.1. `inbox-zero` concordance

| `inbox-zero` model or concept | Closest canonical domain or element | Inclusion decision | Notes |
| --- | --- | --- | --- |
| `EmailMessage.messageId` | `provider_message_id` or `internet_message_id`, depending on stored value | include semantically, not by name | the project should keep provider and RFC ids distinct where `inbox-zero` can blur them |
| `EmailMessage.threadId` | `provider_thread_id` | include | Gmail-centric thread identity is useful, but not canonical conversation identity |
| `EmailMessage.from`, `fromName`, `fromDomain`, `to` | participant + provenance domains | include | aligns well with canonical participant and sender-domain split |
| `Label` | mailbox membership / provider label projection | include semantically, not by product table shape | good evidence that provider labels remain first-class |
| `Rule`, `Action`, `ExecutedAction`, `ScheduledAction` | policy, action history, audit | include as capability area | useful for action/audit breadth, but too product-specific as table names |
| `ThreadTracker` | conversation + action/audit support | include selectively | useful product pattern, but not canonical base |
| `Newsletter`, `ColdEmail`, `CleanupJob`, `CleanupThread`, `MeetingBriefing` | no canonical base equivalent | exclude from base canonical list | product-specific verticals and workflows |

Summary:

- aligns with many workflow and action concepts;
- is much broader than the canonical email substrate;
- should be mined for product entities and action history, not copied as the canonical base.

### 8.2. `gmailsorter` concordance

| `gmailsorter` model or concept | Closest canonical domain or element | Inclusion decision | Notes |
| --- | --- | --- | --- |
| `email_content` | message content + identity | include semantically | useful narrow sidecar pattern for persisted message content |
| `email_threads` | `provider_thread_id` / conversation support | include selectively | Gmail-thread-oriented, but still useful evidence for preserving thread ids |
| `email_labels` | provider label projection | include semantically | confirms label storage is useful, but names are Gmail-oriented |
| `email_from`, `email_to`, `email_cc` | participant domain | include semantically, not by table partitioning | storage-driven split is not ideal canonical naming |
| `ml_labels`, `ml_features` | classification and scoring domain | include as product-owned state | useful example of keeping learned artifacts separate from mailbox state |
| `google_token`, `google_user`, `google_task` | source-account auth / runtime task support | include only where needed operationally | implementation-specific, not canonical email base |

Summary:

- aligns with a narrow Gmail-first classifier sidecar;
- stores useful message, thread, label, participant, token, and ML artifacts;
- uses implementation-specific partitioning and naming that should not become canonical.

### 8.3. Hermes concordance

| Hermes surface or concept | Closest canonical domain or element | Inclusion decision | Notes |
| --- | --- | --- | --- |
| built-in IMAP/SMTP email adapter | mailbox membership, message state, action semantics | include as behavior reference | Hermes is useful evidence for a direct mailbox-native path, not for canonical naming |
| Python stdlib `imaplib`, `smtplib`, `email` stack | message fetch, send, MIME parsing | include as implementation note | confirms a minimal dependency email path is viable |
| polling `UNSEEN` and marking existing inbox mail seen on startup | source sync + read-state behavior | include as behavior note | mailbox-native but opinionated; should not become canonical replay policy |
| reply threading with `In-Reply-To` and `References` | conversation and message headers | include | strong standards alignment |
| filtering `noreply@`, `mailer-daemon@`, `bounce@`, `Auto-Submitted`, `Precedence: bulk`, `List-Unsubscribe` | provenance/auth and bulk/list heuristics | include | useful practical signal set for first-pass filtering and suppression |
| attachment caching and optional attachment skipping | message parts and attachments | include selectively | useful operational pattern, but not core canonical base |
| `EMAIL_ALLOWED_USERS` / pairing / allow-all | policy and access | include semantically | confirms access control belongs alongside the mailbox path, not inside grouping/category logic |
| Honcho and other external memory providers | outside the canonical email substrate | exclude from email base | relevant to personalization architecture, not email canonical modeling |

Summary:

- Hermes is a strong mailbox-native behavior reference for IMAP/SMTP email handling;
- it reinforces standards-based threading, sender filtering, and mailbox-state behavior;
- it does not change the canonical model and should not drive naming;
- its external memory-provider story, including Honcho, belongs outside the canonical email substrate.

These product-specific comparisons can expand here later without changing the canonical model in `EmailModel.md`.

## 9. References

- OpenClaw Gmail mapping and runtime config:
  - `src/gateway/hooks-mapping.ts`
  - `src/hooks/gmail.ts`
  - `src/config/types.hooks.ts`
- `gog` config and auth storage:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/README.md
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/docs/spec.md
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/config/paths.go
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/secrets/store.go
- `gog` watch docs:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/docs/watch.md
- `gog` watch implementation:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/cmd/gmail_watch_cmds.go
- `gog` watch tests:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/cmd/gmail_watch_server_helpers_test.go
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/cmd/gmail_watch_server_exclude_labels_test.go
- Hermes email setup:
  - https://hermes-agent.nousresearch.com/docs/user-guide/messaging/email/
- Hermes features overview:
  - https://hermes-agent.nousresearch.com/docs/user-guide/features/overview
- Himalaya envelope search and sort:
  - `src/email/envelope/command/list.rs`
- Neverest account and backend sync config:
  - `src/account/config.rs`
  - `src/backend/config.rs`
