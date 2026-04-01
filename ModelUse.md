# Model Usage Tracking in OpenClaw and Integrated Agents

This document consolidates information regarding model usage tracking across OpenClaw and its integrated coding agents, particularly Claude Code.

## 1. OpenClaw Session Status (`session_status` tool)

The `session_status` tool provides real-time token usage for the _current active session_.

**Information Provided:**

- **Current Model in Use:** E.g., `anthropic/claude-opus-4-6`
- **Input Tokens:** E.g., `73k in`
- **Output Tokens:** E.g., `542 out`
- **Context Remaining:** E.g., `37k/1.0m (4%)`

**Limitations:**

- It **does not** provide historical usage data for specific timeframes like 5 hours, 7 days, or monthly usage. Its scope is limited to the active session.

## 2. Claude Code Interactive UI Usage

When running Claude Code in an interactive terminal session, it displays usage information directly in its Text User Interface (TUI).

**Information Provided:**

- **Current Session Token Usage:** E.g., `Current session 0% used` (This refers to token usage within the immediate session, not elapsed time).
- **Weekly Usage (All Models):** E.g., `Current week (all models) ██████████████████████████████████████████████████ 100% used`
- **Weekly Reset Time:** E.g., `Resets Feb 17 at 6:59pm (America/Los_Angeles)`

**Limitations:**

- The `claude` CLI `--help` output does not list any options for retrieving historical usage statistics.
- While it provides current session and weekly usage, it **does not** specifically break down usage for arbitrary time windows like "5 hours" (e.g., a rolling 5-hour window).

## 3. Potential for Custom Usage Analysis (`ccusage` tool)

For detailed historical usage analysis over custom timeframes (like a rolling 5-hour window), a third-party CLI tool called `ccusage` is a promising option.

- **Tool Name:** `ryoppippi/ccusage`
- **Source:** [GitHub - ryoppippi/ccusage](https://github.com/ryoppippi/ccusage)
- **Description:** "A CLI tool for analyzing Claude Code/Codex CLI usage from local JSONL files."
- **Relevance:** OpenClaw stores session logs in JSONL format, which `ccusage` is designed to process. This tool would likely be necessary to aggregate token usage over custom time periods not natively provided by the `claude` CLI or `session_status`.

## 4. Model Fallback Chain and API Key Status

OpenClaw is configured with a model fallback chain, utilizing various models and their associated authentication.

**Model Fallback Chain:**

1.  `anthropic/claude-opus-4-6` (primary, OAuth token)
2.  `openai-codex/gpt-5.2-codex` (Codex endpoint, JWT from `~/.codex/auth.json`)
3.  `google/gemini-2.5-flash` (two API keys: free + paid, round-robin)
4.  `openai/gpt-5.2` (standard API, ~$10 balance)

**API Key and Tier Status:**

| Provider | Account                 | Key/Profile              | Tier | Notes                                  |
| -------- | ----------------------- | ------------------------ | ---- | -------------------------------------- |
| Gemini   | `wkarshat@gmail.com`    | `google:free`            | Free | Flash works, Pro quota=0               |
| Gemini   | `alphaeosnet@gmail.com` | `google:paid`            | Paid | Flash works, billing may need linking  |
| OpenAI   | (working key)           | `sk-proj-…` (May 2025)   | N/A  | Active                                 |
| OpenAI   | (dead keys)             | `sk-rJEXZ…` (Walter)     | N/A  | Inactive                               |
| OpenAI   | (dead keys)             | `sk-Y0Ybg…` (Kinsys)     | N/A  | Inactive                               |
| Codex    | N/A                     | `openai-codex:codex-cli` | N/A  | JWT expires ~10 days, requires refresh |
