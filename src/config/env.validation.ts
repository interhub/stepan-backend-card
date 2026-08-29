import { DEFAULT_DATABASE_URL, DEFAULT_PORT } from './configuration';

const FILE_URL_PREFIX = 'file:';
const DECIMAL_RADIX = 10;

/** Nest hands over the raw process environment, where every value is a string. */
type RawEnvironment = Record<string, string | undefined>;

/**
 * Fails fast on a broken environment instead of letting Prisma throw a vague
 * connection error later on.
 */
export const validateEnv = (config: RawEnvironment): RawEnvironment => {
  const databaseUrl = config.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  if (!databaseUrl.startsWith(FILE_URL_PREFIX)) {
    throw new Error(`DATABASE_URL must be a SQLite file URL, received "${databaseUrl}"`);
  }
  const port = Number.parseInt(config.PORT ?? String(DEFAULT_PORT), DECIMAL_RADIX);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`PORT must be a positive number, received "${String(config.PORT)}"`);
  }
  return { ...config, DATABASE_URL: databaseUrl };
};
