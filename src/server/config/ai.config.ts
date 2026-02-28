// FEAT-1: AI configuration for syntax analysis
export const aiConfig = {
  provider: (process.env.AI_PROVIDER || 'anthropic') as 'anthropic' | 'openai',
  // Anthropic
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  // OpenAI (fallback)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // Common
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '8000', 10),
  temperature: 0.3,
  timeoutMs: 60000,

  get apiKey() {
    return this.provider === 'anthropic' ? this.anthropicApiKey : this.openaiApiKey;
  },
  get model() {
    return this.provider === 'anthropic' ? this.anthropicModel : this.openaiModel;
  },
};
