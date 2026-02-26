// FEAT-0: JWT configuration
export const jwtConfig = {
  accessSecret: new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me'),
  refreshSecret: new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  ),
  accessExpiresIn: '15m' as const,
  refreshExpiresIn: '7d' as const,
  algorithm: 'HS256' as const,
};
