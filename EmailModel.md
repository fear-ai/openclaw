# Email Canonical Model

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Scope](#2-scope)
- [3. Canonical Sources Of Semantics](#3-canonical-sources-of-semantics)
  - [3.1. Internet message format and MIME](#31-internet-message-format-and-mime)
  - [3.2. Mailbox and state semantics](#32-mailbox-and-state-semantics)
  - [3.3. Local storage projection](#33-local-storage-projection)
  - [3.4. Provider-native projections](#34-provider-native-projections)
- [4. Canonical Domains](#4-canonical-domains)
- [5. Canonical Information Elements](#5-canonical-information-elements)
  - [5.1. Identity](#51-identity)
  - [5.2. Conversation](#52-conversation)
  - [5.3. Participants](#53-participants)
  - [5.4. Content](#54-content)
  - [5.5. Message parts and attachments](#55-message-parts-and-attachments)
  - [5.6. Mailbox membership and placement](#56-mailbox-membership-and-placement)
  - [5.7. Message state](#57-message-state)
  - [5.8. Provenance and authentication](#58-provenance-and-authentication)
  - [5.9. Source sync and change tracking](#59-source-sync-and-change-tracking)
  - [5.10. Policy, ownership, and access](#510-policy-ownership-and-access)
  - [5.11. Feedback and action history](#511-feedback-and-action-history)
  - [5.12. Classification and scoring](#512-classification-and-scoring)
- [6. Canonical Behaviors](#6-canonical-behaviors)
  - [6.1. Read and preview](#61-read-and-preview)
  - [6.2. Reply and forward state](#62-reply-and-forward-state)
  - [6.3. Delete, trash, and suppression](#63-delete-trash-and-suppression)
  - [6.4. Conversation and threading](#64-conversation-and-threading)
  - [6.5. Provider change feeds and replay](#65-provider-change-feeds-and-replay)
- [7. Canonical Entity Relationships](#7-canonical-entity-relationships)
- [8. Adaptation Rules](#8-adaptation-rules)
  - [8.1. Provider-native fields](#81-provider-native-fields)
  - [8.2. Mailbox-native abstractions](#82-mailbox-native-abstractions)
  - [8.3. Product-owned state](#83-product-owned-state)
  - [8.4. Source adapter contract](#84-source-adapter-contract)
- [9. References](#9-references)

## 1. Purpose

This document defines the canonical technical model for email in this workspace.

It is the place for:

- canonical naming;
- entity definitions;
- value semantics;
- behavior definitions;
- relationship definitions;
- adaptation rules from providers, protocols, libraries, and products.

It is not the place for market framing or tool-selection narrative. Those belong in `Email.md`.

## 2. Scope

The model is intentionally broader than any one implementation surface.

It must be able to express:

- standard email message semantics;
- mailbox and state semantics;
- Maildir storage projections;
- provider-native projections such as Gmail;
- product-owned feedback, policy, and scoring state.

## 3. Canonical Sources Of Semantics

### 3.1. Internet message format and MIME

The base message object follows the standard email stack:

- RFC 5322 style message headers and identity;
- MIME body structure and part semantics;
- attachment metadata and content disposition.

These define the canonical meaning of:

- `Message-ID`
- `In-Reply-To`
- `References`
- `Date`
- `From`
- `Sender`
- `Reply-To`
- `To`
- `Cc`
- `Bcc`
- `Subject`
- multipart structure
- text and attachment part distinctions

### 3.2. Mailbox and state semantics

Mailbox placement and message state are ultimately mailbox semantics rather than transport semantics.

The canonical state model therefore follows dominant IMAP and Maildir behavior:

- mailbox membership;
- read/seen;
- answered;
- flagged/starred;
- deleted/trashed;
- draft;
- sent.

### 3.3. Local storage projection

Maildir is a storage projection, not the top-level canonical model.

Its useful semantics are:

- `tmp`, `new`, `cur`;
- Maildir++ folder structure where applicable;
- filename-carried flags via `:2,FLAGS`.

These should map into the canonical model, not replace it.

### 3.4. Provider-native projections

Provider-native fields remain important when they carry unique behavior.

Examples:

- Gmail message `id`;
- Gmail `threadId`;
- Gmail `historyId`;
- Gmail `labelIds`;
- Gmail `internalDate`.

These must be preserved alongside canonical fields rather than collapsed into them.

## 4. Canonical Domains

The canonical model is grouped into the following domains:

1. identity
2. conversation
3. participants
4. content
5. message parts and attachments
6. mailbox membership and placement
7. message state
8. provenance and authentication
9. source sync and change tracking
10. policy, ownership, and access
11. feedback and action history
12. classification and scoring

These are domains, not layers. They describe different kinds of information, not a strict execution hierarchy.

## 5. Canonical Information Elements

### 5.1. Identity

- `canonical_message_id`
  - local durable normalized id for one logical message.
- `internet_message_id`
  - value of the RFC `Message-ID` header when present.
- `provider_message_id`
  - provider-native stable id such as Gmail `id`.
- `source_account_id`
  - local id for the source mailbox/account.
- `duplicate_group_id`
  - local grouping id when multiple stored artifacts represent the same logical message.

### 5.2. Conversation

- `conversation_id`
  - local normalized conversation or thread id.
- `provider_thread_id`
  - provider-native thread id, such as Gmail `threadId`.
- `in_reply_to_message_id`
  - normalized value from `In-Reply-To`.
- `references_message_ids`
  - normalized list derived from `References`.
- `subject_normalized`
  - normalized subject for secondary grouping or comparison only.

### 5.3. Participants

- `from_address`
- `from_display_name`
- `sender_address`
- `reply_to_addresses`
- `to_addresses`
- `cc_addresses`
- `bcc_addresses`
- `participant_domains`

Use plural arrays for recipient collections. Do not collapse `From`, `Sender`, and `Reply-To`.

### 5.4. Content

- `subject`
- `snippet`
- `body_text`
- `body_html`
- `body_excerpt`
- `body_is_partial`
- `content_language`
- `content_hash`

`snippet` is provider-native summary text when the provider offers it. `body_excerpt` is the product-owned display slice. `body_is_partial` captures whether the available body content is known to be truncated or incomplete relative to the source message.

### 5.5. Message parts and attachments

- `attachment_count`
- `attachment_metadata`
- `mime_type`
- `content_disposition`
- `content_id`
- `filename`
- `size_bytes`
- `charset`
- `transfer_encoding`

These may be stored as part records or as structured metadata attached to the message, depending on implementation needs.

### 5.6. Mailbox membership and placement

- `mailbox_memberships`
- `mailbox_name`
- `provider_label_id`
- `provider_label_name`
- `primary_mailbox`
- `is_in_inbox`
- `is_in_spam`
- `is_in_trash`
- `system_category`

`mailbox_memberships` is the neutral abstraction over folder placement and label placement.

### 5.7. Message state

- `is_read`
- `is_answered`
- `is_flagged`
- `is_deleted`
- `is_draft`
- `is_sent`
- `is_forwarded`

This is the normalized state surface for IMAP- and Maildir-like semantics.

### 5.8. Provenance and authentication

- `date_header_at`
- `received_at`
- `internal_received_at`
- `return_path`
- `authentication_results`
- `dkim_result`
- `spf_result`
- `dmarc_result`
- `arc_result`
- `list_id`
- `list_post`
- `list_unsubscribe`
- `auto_submitted`
- `precedence`
- `sender_domain`
- `from_domain`

`internal_received_at` must remain distinct from `date_header_at`. Provider-managed internal arrival/order timestamps are not the same as RFC `Date`.

### 5.9. Source sync and change tracking

- `provider_history_id`
- `sync_cursor`
- `sync_observed_at`
- `source_change_type`
- `source_change_sequence`
- `sync_run_id`
- `sync_origin`
- `store_locator`

This domain captures change-feed semantics, incremental sync state, and physical storage location.

Important distinction:

- `provider_history_id` is a provider mutation-sequence anchor, not a message timestamp;
- change feeds may report deletions or label changes without including a full message projection;
- adapters must preserve these change records even when only ids or mailbox mutations are available.

### 5.10. Policy, ownership, and access

- `source_account_owner_id`
- `policy_owner_id`
- `access_principal_id`
- `action_authority`
- `visibility_scope`
- `tenant_id`

Ownership is not grouping. It is the policy and access surface that determines whose preferences apply and who may observe or act.

### 5.11. Feedback and action history

- `shown_at`
- `opened_at`
- `read_dwell_ms`
- `starred_at`
- `replied_at`
- `forwarded_at`
- `archived_at`
- `marked_spam_at`
- `deleted_at`
- `rescued_from_spam_at`
- `explicit_feedback_text`
- `explicit_feedback_type`
- `feedback_actor_id`

### 5.12. Classification and scoring

- `relevance_score`
- `urgency_score`
- `follow_up_score`
- `interest_score`
- `risk_score`
- `billing_score`
- `work_score`
- `personal_score`
- `bulk_score`
- `category_assignments`
- `suppression_state`
- `explanation_summary`
- `feature_version`
- `model_version`
- `policy_version`

## 6. Canonical Behaviors

### 6.1. Read and preview

Reading and preview are distinct behaviors.

- preview should not necessarily mutate message state;
- full read often implies `is_read = true` in mailbox-native tools;
- this behavior must remain observable and reversible where the source allows it.

### 6.2. Reply and forward state

Reply and forward are actions with downstream state implications.

- reply commonly implies answered state;
- forward may or may not be explicitly represented by the source;
- message-state normalization should preserve both the action event and any mailbox-level state change.

### 6.3. Delete, trash, and suppression

These are different concepts:

- delete as provider/mailbox state mutation;
- trash as mailbox placement;
- suppression as product-owned visibility policy.

They must not be conflated.

### 6.4. Conversation and threading

Conversation is derived from:

- provider-native thread ids where available;
- RFC threading headers where available;
- local normalization and fallback rules.

No single source should be treated as universally canonical across providers.

### 6.5. Provider change feeds and replay

Provider change feeds and message timestamps are different semantics.

- provider history/change ids are mutation-sequence anchors;
- message timestamps represent author or arrival timing;
- change batches may include deletions or mailbox-state mutations without message bodies;
- replay systems need both.

## 7. Canonical Entity Relationships

The intended relationship structure is:

- one source account -> many mailbox memberships
- one canonical message -> zero or one provider-native message id per source projection
- one canonical message -> many store locators
- one conversation -> many messages
- one message -> many participants
- one message -> many parts or attachments
- one message -> many mailbox memberships over time
- one message -> many feedback and action events
- one message -> many derived score snapshots over time
- one policy owner -> many feedback items and policy expressions
- one provider change batch -> many change events
- one change event -> zero or more affected provider message ids

These relationships should be preserved even if the physical database uses denormalized views for performance.

## 8. Adaptation Rules

### 8.1. Provider-native fields

Keep provider-native fields when they carry unique behavior.

Examples:

- Gmail `id` maps to `provider_message_id`
- Gmail `threadId` maps to `provider_thread_id`
- Gmail `historyId` maps to `provider_history_id`
- Gmail `internalDate` maps to `internal_received_at`
- Gmail `labelIds` remain provider-native placement fields alongside canonical mailbox memberships
- `gog` `bodyTruncated` maps to `body_is_partial`

Do not collapse them into generic fields when semantics differ.

Service, configuration, and credential ownership should also remain explicit:

- keep mailbox credentials distinct from watch/webhook runtime settings;
- keep IMAP/SMTP passwords or app passwords distinct from OAuth refresh tokens;
- keep OAuth client credentials distinct from refresh-token storage;
- keep receive-path credentials distinct from send-path credentials when the tool exposes both;
- keep service-account credentials distinct from end-user OAuth refresh tokens;
- do not treat a shared config root as evidence that all configuration and credential concerns have the same owner.

### 8.2. Mailbox-native abstractions

Map provider folders, IMAP mailboxes, and Maildir placement into `mailbox_memberships`.

Do not force labels to become folders or folders to become labels in the canonical model.

### 8.3. Product-owned state

Keep product-owned state explicit:

- suppression and relevance decisions;
- feedback;
- explanations;
- audit and replay state.

These should not be encoded indirectly through mailbox mutations alone.

### 8.4. Source adapter contract

Any source adapter that feeds the canonical model should provide a stable minimum contract.

Required message identity fields:

- `source_account_id`
- `provider_message_id` when the source has one
- `internet_message_id` when present
- `store_locator` when the source is backed by a durable local mirror

Required message content and participant fields:

- `subject`
- `snippet` or another summary slice if the source provides one
- `body_text` when available without excessive extra fetch cost
- `body_is_partial` when the source can explicitly indicate truncation or incompleteness
- `from_address`
- `to_addresses`
- `date_header_at` when available from message headers

Required placement and state fields:

- `mailbox_memberships`
- `is_read`
- `is_flagged`
- `is_draft`
- `is_in_spam`
- `is_in_trash`

Required sync and replay fields:

- `sync_observed_at`
- `sync_origin`
- `provider_history_id` when the source provides change-log anchors
- `source_change_type` when the source provides event semantics

Required adapter behavior:

- idempotent handling of repeated source events
- explicit preservation of source-native ids and mailbox placement
- explicit marking of lossy mappings
- ability to persist enough source truth to support replay without reinterpreting old events

Recommended fields for the first useful prioritization and display pass:

- `provider_thread_id`
- `provider_label_name`
- `internal_received_at`
- `authentication_results`
- `list_id`
- `list_unsubscribe`

Recommended adapter outputs:

- one canonical message projection
- zero or more change-event records
- one source snapshot or source payload reference for replay and audit

The adapter contract is intentionally capability-first. It should not force Gmail, IMAP, Maildir, or Pimalaya-native names into the canonical model. It should preserve their behavior while producing the canonical fields above.

## 9. References

- Gmail API message resource:
  - https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages
- Gmail API history resource:
  - https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list
- `gog` watch docs:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/docs/watch.md
- `gog` watch implementation:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/cmd/gmail_watch_cmds.go
- `gog` message fetch implementation:
  - https://github.com/steipete/gogcli/blob/4067cc6e570fdc70d6ef19d1f20a1f0d10b54a82/internal/cmd/gmail_messages.go
- OpenClaw Gmail Pub/Sub docs:
  - https://docs.openclaw.ai/automation/gmail-pubsub
