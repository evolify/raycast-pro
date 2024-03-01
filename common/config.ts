export const GEMINI_MODELS= [
  {
    id: 'gemini-pro',
    model: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    provider_name: 'Google',
    requires_better_ai: true,
    features: ['chat', 'quick_ai', 'commands', 'api'],
  },
]

export const DEFAULT_GEMINI_MODELS = {
  chat: 'gemini-pro',
  quick_ai: 'gemini-pro',
  commands: 'gemini-pro',
  api: 'gemini-pros',
}
