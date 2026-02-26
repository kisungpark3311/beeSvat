// FEAT-1: AI configuration for syntax analysis
export const aiConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY || '',
  maxTokens: 4000,
  temperature: 0.3,
  timeoutMs: 30000,
};
