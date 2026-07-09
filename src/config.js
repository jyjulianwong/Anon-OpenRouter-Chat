export const AVAILABLE_MODELS = [
  'google/gemini-2.5-flash-lite',
  'google/gemini-2.5-flash',
  'meta-llama/llama-4-maverick',
  'meta-llama/llama-4-scout',
  'openai/gpt-5-nano',
  'openai/gpt-5.4-nano',
  'qwen/qwen3.5-flash-02-23',
  'qwen/qwen3.6-flash',
];

export const DEFAULT_SETTINGS = {
  model: 'google/gemini-2.5-flash-lite',
  temperature: 1.0,
  maxTokens: '',
  systemPrompt: '',
  safePrompt: false,
};
