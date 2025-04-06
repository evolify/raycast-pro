export const GEMINI_MODELS = [
  {
    id: "gemini-pro",
    model: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    provider_name: "Google",
    provider_brand: "google",
    description: "raycast ai",
    features: ["chat", "quick_ai", "commands", "api"],
    speed: 3,
    intelligence: 3,
    context: 16,
    suggestions: ["chat", "quick_ai", "commands"],
    in_better_ai_subscription: false,
    requires_better_ai: false,
    status: null as any,
    capabilities: {},
  },
]

export const GROQ_MODELS = [
  {
    id: "deepseek-r1-distill-qwen-32b",
    provider: "alibaba",
    context: 131072,
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    provider: "meta",
    context: 131072,
  },
  {
    id: "llama3-70b-8192",
    provider: "meta",
    context: 8192,
  },
  {
    id: "llama-3.3-70b-specdec",
    provider: "Meta",
    context: 8192,
  },
  {
    id: "qwen-qwq-32b",
    provider: "alibaba",
    context: 131072,
  },
].map(t => {
  const provider_name = t.provider[0].toUpperCase() + t.provider.slice(1)
  const name = t.id
    .split("-")
    .map(t => t[0].toUpperCase() + t.slice(1))
    .join(" ")
  return {
    ...t,
    model: t.id,
    name: `${name} (Groq/${provider_name})`,
    provider_name,
    provider_brand: t.provider,
    description: "raycast ai",
    features: ["chat", "quick_ai", "commands", "api"],
    speed: 3,
    intelligence: 3,
    context: t.context,
    suggestions: ["chat", "quick_ai", "commands"],
    in_better_ai_subscription: false,
    requires_better_ai: false,
    status: null as number,
    capabilities: {},
  }
})

export const DEFAULT_GEMINI_MODELS = {
  chat: "gemini-pro",
  quick_ai: "gemini-pro",
  commands: "gemini-pro",
  api: "gemini-pros",
  emoji_search: "gemini-pro",
  tools: "gemini-pro",
}

export const DEFAULT_GREQ_MODELS = {
  chat: "deepseek-r1-distill-qwen-32b",
  quick_ai: "deepseek-r1-distill-qwen-32b",
  api: "deepseek-r1-distill-qwen-32b",
  commands: "deepseek-r1-distill-qwen-32b",
  emoji_search: "deepseek-r1-distill-qwen-32b",
  tools: "deepseek-r1-distill-qwen-32b",
}

export const MODELS = GROQ_MODELS.concat(GEMINI_MODELS)

export const DEFAULT_MODELS = DEFAULT_GREQ_MODELS

console.log(MODELS)
