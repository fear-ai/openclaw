export type GmailHookPayloadMessage = {
  id?: string;
  threadId?: string;
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
  snippet?: string;
  body?: string;
  bodyTruncated?: boolean;
  labels?: string[];
};

export type GmailHookPayload = {
  source?: string;
  account?: string;
  historyId?: string;
  deletedMessageIds?: string[];
  messages?: GmailHookPayloadMessage[];
};

export type GmailHookTemplateScope = {
  eventKey: string;
  historyId?: string;
  deletedMessageIds: string[];
  deletedCount: number;
  deletedMessageIdsText?: string;
  first?: GmailHookPayloadMessage & {
    labelsText?: string;
    bodyStatus?: string;
  };
  summary: string;
};

export function buildGmailHookTemplateScope(
  payload: Record<string, unknown>,
): GmailHookTemplateScope | null {
  const gmail = parseGmailHookPayload(payload);
  if (!gmail) {
    return null;
  }
  const first = gmail.messages?.[0];
  const deletedMessageIds = gmail.deletedMessageIds ?? [];
  const labelsText = first?.labels?.length ? first.labels.join(", ") : undefined;
  const bodyStatus = first?.bodyTruncated ? "truncated" : undefined;
  const eventKey =
    first?.id ||
    (gmail.historyId ? `history:${gmail.historyId}` : undefined) ||
    deletedMessageIds[0];
  if (!eventKey) {
    return null;
  }

  return {
    eventKey,
    historyId: gmail.historyId,
    deletedMessageIds,
    deletedCount: deletedMessageIds.length,
    deletedMessageIdsText: deletedMessageIds.length ? deletedMessageIds.join(", ") : undefined,
    first: first
      ? {
          ...first,
          labelsText,
          bodyStatus,
        }
      : undefined,
    summary: buildSummary({
      historyId: gmail.historyId,
      deletedMessageIds,
      first: first
        ? {
            ...first,
            labelsText,
            bodyStatus,
          }
        : undefined,
    }),
  };
}

function parseGmailHookPayload(payload: Record<string, unknown>): GmailHookPayload | null {
  const record = isRecord(payload) ? payload : null;
  if (!record) {
    return null;
  }
  const messages = Array.isArray(record.messages)
    ? record.messages
        .map(parseMessage)
        .filter((item): item is GmailHookPayloadMessage => item !== null)
    : [];
  const deletedMessageIds = asStringArray(record.deletedMessageIds);
  const historyId = asString(record.historyId);
  const source = asString(record.source);
  const account = asString(record.account);
  if (!messages.length && !deletedMessageIds.length && !historyId && source !== "gmail") {
    return null;
  }
  return {
    source,
    account,
    historyId,
    deletedMessageIds,
    messages,
  };
}

function parseMessage(value: unknown): GmailHookPayloadMessage | null {
  if (!isRecord(value)) {
    return null;
  }
  const message: GmailHookPayloadMessage = {
    id: asString(value.id),
    threadId: asString(value.threadId),
    from: asString(value.from),
    to: asString(value.to),
    subject: asString(value.subject),
    date: asString(value.date),
    snippet: asString(value.snippet),
    body: asString(value.body),
    bodyTruncated: typeof value.bodyTruncated === "boolean" ? value.bodyTruncated : undefined,
    labels: asStringArray(value.labels),
  };
  return Object.values(message).some((entry) => entry !== undefined && entry !== "")
    ? message
    : null;
}

function buildSummary(params: {
  historyId?: string;
  deletedMessageIds: string[];
  first?: GmailHookPayloadMessage & { labelsText?: string; bodyStatus?: string };
}): string {
  const lines: string[] = [];
  const first = params.first;
  if (first) {
    lines.push(`New email from ${first.from || "unknown sender"}`);
    if (first.to) {
      lines.push(`To: ${first.to}`);
    }
    if (first.subject) {
      lines.push(`Subject: ${first.subject}`);
    }
    if (first.date) {
      lines.push(`Date: ${first.date}`);
    }
    if (first.threadId) {
      lines.push(`Thread: ${first.threadId}`);
    }
    if (first.labelsText) {
      lines.push(`Labels: ${first.labelsText}`);
    }
    if (first.snippet) {
      lines.push(first.snippet);
    }
    if (first.body) {
      lines.push(first.body);
    }
    if (first.bodyStatus === "truncated") {
      lines.push("[body truncated]");
    }
  } else {
    lines.push("Gmail mailbox update");
  }
  if (params.historyId) {
    lines.push(`History: ${params.historyId}`);
  }
  if (params.deletedMessageIds.length) {
    lines.push(`Deleted IDs: ${params.deletedMessageIds.join(", ")}`);
  }
  return lines.join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}
