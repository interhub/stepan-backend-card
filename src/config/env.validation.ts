import { readEnvText } from '../common/env-value';
import {
  DEFAULT_DATABASE_URL,
  DEFAULT_GRAPHQL_PATH,
  DEFAULT_PORT,
  DEFAULT_PROFILE_SLUG,
} from './configuration';

const FILE_URL_PREFIX = 'file:';
const PATH_PREFIX = '/';
const DECIMAL_RADIX = 10;

/** Nest hands over the raw process environment, where every value is a string. */
type RawEnvironment = Record<string, string | undefined>;

const validateDatabaseUrl = (rawValue: string | undefined): string => {
  const databaseUrl = readEnvText(rawValue, DEFAULT_DATABASE_URL);
  if (!databaseUrl.startsWith(FILE_URL_PREFIX)) {
    throw new Error(`DATABASE_URL must be a SQLite file URL, received "${databaseUrl}"`);
  }
  return databaseUrl;
};

const validatePort = (rawValue: string | undefined): string => {
  const portText = readEnvText(rawValue, String(DEFAULT_PORT));
  const port = Number.parseInt(portText, DECIMAL_RADIX);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`PORT must be a positive number, received "${portText}"`);
  }
  return String(port);
};

const validateGraphqlPath = (rawValue: string | undefined): string => {
  const graphqlPath = readEnvText(rawValue, DEFAULT_GRAPHQL_PATH);
  if (!graphqlPath.startsWith(PATH_PREFIX)) {
    throw new Error(`GRAPHQL_PATH must start with "/", received "${graphqlPath}"`);
  }
  return graphqlPath;
};

/**
 * Missing and empty values are replaced by the defaults from
 * `configuration.ts`, so a clone without an `.env` file still starts. Only a
 * value that is present and genuinely wrong stops the application, which keeps
 * a typo from turning into a vague Prisma connection error later on.
 */
export const validateEnv = (config: RawEnvironment): RawEnvironment => ({
  ...config,
  DATABASE_URL: validateDatabaseUrl(config.DATABASE_URL),
  PORT: validatePort(config.PORT),
  GRAPHQL_PATH: validateGraphqlPath(config.GRAPHQL_PATH),
  PROFILE_SLUG: readEnvText(config.PROFILE_SLUG, DEFAULT_PROFILE_SLUG),
});
