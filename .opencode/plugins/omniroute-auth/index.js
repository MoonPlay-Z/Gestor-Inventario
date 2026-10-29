import { Model, Plugin, Provider } from "@opencode/plugin";
import {
  fetchModels,
  OMNIROUTE_DEFAULT_MODELS,
} from "opencode-omniroute-auth/runtime";

const PROVIDER_ID = "omniroute";
const DEFAULT_BASE_URL = "http://localhost:20128/v1";
const RUNTIME_PACKAGE = "@opencode/ai/providers/openai-compatible";
const DEFAULT_CONTEXT_LIMIT = 128000;
const DEFAULT_OUTPUT_LIMIT = 4096;

function positiveInteger(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function toModelInfo(model) {
  const info = Model.Info.default(PROVIDER_ID, model.id);
  const contextWindow = positiveInteger(
    model.contextWindow ?? model.context_length ?? model.max_input_tokens,
    DEFAULT_CONTEXT_LIMIT,
  );
  const outputLimit = positiveInteger(
    model.maxTokens ?? model.max_output_tokens,
    DEFAULT_OUTPUT_LIMIT,
  );

  info.name = model.name || model.id;
  info.limit.context = contextWindow;
  info.limit.input = contextWindow;
  info.limit.output = outputLimit;
  info.capabilities.tools = model.supportsTools ?? model.tool_calling ?? true;
  info.capabilities.input = [
    "text",
    ...(model.supportsVision ?? model.vision ?? model.capabilities?.vision
      ? ["image"]
      : []),
  ];
  info.capabilities.output = ["text"];
  if (typeof model.supportsTemperature === "boolean") {
    info.capabilities.temperature = model.supportsTemperature;
  }

  return info;
}

async function loadModels(baseURL, apiKey) {
  if (!apiKey) return OMNIROUTE_DEFAULT_MODELS;

  return fetchModels(
    {
      baseUrl: baseURL,
      apiKey,
      apiMode: "chat",
      defaultModels: OMNIROUTE_DEFAULT_MODELS,
    },
    apiKey,
  );
}

export default Plugin.define({
  id: "omniroute.auth",
  async setup(ctx) {
    const baseURL =
      process.env.OMNIROUTE_BASE_URL?.trim() || DEFAULT_BASE_URL;
    const apiKey = process.env.OMNIROUTE_API_KEY?.trim();
    const models = (await loadModels(baseURL, apiKey)).map(toModelInfo);

    await ctx.provider.transform((editor) => {
      const existing = editor.get(PROVIDER_ID);
      if (existing) {
        editor.update(PROVIDER_ID, (provider) => {
          provider.name = "OmniRoute";
          provider.activation = "enabled";
          provider.package = RUNTIME_PACKAGE;
          provider.settings = {
            ...provider.settings,
            baseURL,
          };
          if (apiKey) {
            provider.headers = {
              ...provider.headers,
              Authorization: `Bearer ${apiKey}`,
            };
          }
        });
        editor.models.set(PROVIDER_ID, models);
        return;
      }

      const info = Provider.Info.empty(PROVIDER_ID);
      info.name = "OmniRoute";
      info.activation = "enabled";
      info.package = RUNTIME_PACKAGE;
      info.settings = { baseURL };
      if (apiKey) {
        info.headers = { Authorization: `Bearer ${apiKey}` };
      }

      editor.add({ info, models });
    });
  },
});
