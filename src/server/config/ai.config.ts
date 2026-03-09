// FEAT-1: AI configuration for syntax analysis
export const aiConfig = {
  provider: (process.env.AI_PROVIDER || 'anthropic') as 'anthropic' | 'openai' | 'gemini' | 'glm',
  // Anthropic
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // Google Gemini
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  // ZhipuAI GLM
  glmApiKey: process.env.GLM_API_KEY || '',
  glmModel: process.env.GLM_MODEL || 'glm-4.7-flash',
  glmBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  // Common
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '8000', 10),
  temperature: 0.3,
  timeoutMs: 60000,

  get apiKey() {
    if (this.provider === 'anthropic') return this.anthropicApiKey;
    if (this.provider === 'gemini') return this.geminiApiKey;
    if (this.provider === 'glm') return this.glmApiKey;
    return this.openaiApiKey;
  },
  get model() {
    if (this.provider === 'anthropic') return this.anthropicModel;
    if (this.provider === 'gemini') return this.geminiModel;
    if (this.provider === 'glm') return this.glmModel;
    return this.openaiModel;
  },
};
