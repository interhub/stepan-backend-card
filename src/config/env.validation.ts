type EnvRecord = Record<string, unknown>;

/**
 * Fails fast on a broken environment instead of letting Prisma throw a vague
 * connection error later on.
 */
export const validateEnv = (config: EnvRecord): EnvRecord => {
  const databaseUrl = (config.DATABASE_URL as string | undefined) ?? 'file:./card.db';

  if (!databaseUrl.startsWith('file:')) {
    throw new Error(`DATABASE_URL must be a SQLite file URL, received "${databaseUrl}"`);
  }

  const port = Number.parseInt((config.PORT as string | undefined) ?? '3000', 10);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`PORT must be a positive number, received "${String(config.PORT)}"`);
  }

  return { ...config, DATABASE_URL: databaseUrl };
};
