import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { createEmptyPluginRegistry } from "../plugins/registry.js";
import { setActivePluginRegistry } from "../plugins/runtime.js";
import { loadBundledChannelSecretContractApi } from "./channel-contract-api.js";

const slackSecrets = loadBundledChannelSecretContractApi("slack");
const telegramSecrets = loadBundledChannelSecretContractApi("telegram");
if (
  !slackSecrets?.collectRuntimeConfigAssignments ||
  !telegramSecrets?.collectRuntimeConfigAssignments
) {
  throw new Error("Missing Slack or Telegram secret contract api");
}

vi.mock("../channels/plugins/bootstrap-registry.js", () => {
  return {
    getBootstrapChannelPlugin: (id: string) => {
      if (id === "slack") {
        return {
          secrets: {
            collectRuntimeConfigAssignments: slackSecrets.collectRuntimeConfigAssignments,
          },
        };
      }
      if (id === "telegram") {
        return {
          secrets: {
            collectRuntimeConfigAssignments: telegramSecrets.collectRuntimeConfigAssignments,
          },
        };
      }
      return undefined;
    },
    getBootstrapChannelSecrets: (id: string) => {
      if (id === "slack") {
        return {
          collectRuntimeConfigAssignments: slackSecrets.collectRuntimeConfigAssignments,
        };
      }
      if (id === "telegram") {
        return {
          collectRuntimeConfigAssignments: telegramSecrets.collectRuntimeConfigAssignments,
        };
      }
      return undefined;
    },
  };
});

function asConfig(value: unknown): OpenClawConfig {
  return value as OpenClawConfig;
}

let clearConfigCache: typeof import("../config/config.js").clearConfigCache;
let clearRuntimeConfigSnapshot: typeof import("../config/config.js").clearRuntimeConfigSnapshot;
let clearSecretsRuntimeSnapshot: typeof import("./runtime.js").clearSecretsRuntimeSnapshot;
let prepareSecretsRuntimeSnapshot: typeof import("./runtime.js").prepareSecretsRuntimeSnapshot;

describe("secrets runtime snapshot channel secret availability", () => {
  beforeAll(async () => {
    ({ clearConfigCache, clearRuntimeConfigSnapshot } = await import("../config/config.js"));
    ({ clearSecretsRuntimeSnapshot, prepareSecretsRuntimeSnapshot } = await import("./runtime.js"));
  });

  afterEach(() => {
    setActivePluginRegistry(createEmptyPluginRegistry());
    clearSecretsRuntimeSnapshot();
    clearRuntimeConfigSnapshot();
    clearConfigCache();
  });

  it("keeps active Slack SecretRefs unresolved and warns when required tokens are unavailable", async () => {
    const snapshot = await prepareSecretsRuntimeSnapshot({
      config: asConfig({
        channels: {
          slack: {
            botToken: { source: "env", provider: "default", id: "EMPTY_SLACK_BOT_TOKEN" },
            appToken: { source: "env", provider: "default", id: "EMPTY_SLACK_APP_TOKEN" },
          },
        },
      }),
      env: {
        EMPTY_SLACK_BOT_TOKEN: "",
        EMPTY_SLACK_APP_TOKEN: "",
      },
      agentDirs: ["/tmp/openclaw-agent-main"],
      loadAuthStore: () => ({ version: 1, profiles: {} }),
    });

    expect(snapshot.config.channels?.slack?.botToken).toEqual({
      source: "env",
      provider: "default",
      id: "EMPTY_SLACK_BOT_TOKEN",
    });
    expect(snapshot.config.channels?.slack?.appToken).toEqual({
      source: "env",
      provider: "default",
      id: "EMPTY_SLACK_APP_TOKEN",
    });
    expect(snapshot.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SECRETS_REF_UNAVAILABLE_NONFATAL",
          path: "channels.slack.botToken",
        }),
        expect.objectContaining({
          code: "SECRETS_REF_UNAVAILABLE_NONFATAL",
          path: "channels.slack.appToken",
        }),
      ]),
    );
  });

  it("keeps active Telegram SecretRefs unresolved and warns when the bot token is unavailable", async () => {
    const snapshot = await prepareSecretsRuntimeSnapshot({
      config: asConfig({
        channels: {
          telegram: {
            botToken: { source: "env", provider: "default", id: "EMPTY_TELEGRAM_BOT_TOKEN" },
          },
        },
      }),
      env: {
        EMPTY_TELEGRAM_BOT_TOKEN: "",
      },
      agentDirs: ["/tmp/openclaw-agent-main"],
      loadAuthStore: () => ({ version: 1, profiles: {} }),
    });

    expect(snapshot.config.channels?.telegram?.botToken).toEqual({
      source: "env",
      provider: "default",
      id: "EMPTY_TELEGRAM_BOT_TOKEN",
    });
    expect(snapshot.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SECRETS_REF_UNAVAILABLE_NONFATAL",
          path: "channels.telegram.botToken",
        }),
      ]),
    );
  });
});
