import { readEnvNumber, readEnvText } from '../common/env-value';

export const DEFAULT_PORT = 3000;
export const DEFAULT_GRAPHQL_PATH = '/';
export const DEFAULT_PROFILE_SLUG = 'stepan-turchenko';
/** Relative SQLite paths are resolved against `prisma/`, where the committed file lives. */
export const DEFAULT_DATABASE_URL = 'file:./card.db';

const DEFAULT_DATABASE_TMP_PATH = '/tmp/card.db';
const EMPTY_TEXT = '';
const TRUTHY_FLAG_VALUES = ['true', '1', 'yes'];

export interface DatabaseConfiguration {
  url: string;
  /**
   * Serverless runtimes expose a read-only file system with the single
   * exception of /tmp, so the SQLite file has to be copied there first.
   */
  copyToTmp: boolean;
  tmpPath: string;
  /** Prints every generated SQL statement, handy to prove the N+1 fix. */
  logQueries: boolean;
}

export interface AppConfiguration {
  port: number;
  graphqlPath: string;
  profileSlug: string;
  database: DatabaseConfiguration;
}

const isTruthyFlag = (rawValue: string | undefined): boolean => {
  const flagValue = readEnvText(rawValue, EMPTY_TEXT);
  return TRUTHY_FLAG_VALUES.includes(flagValue);
};

/** Vercel sets this variable on both the build step and the lambda runtime. */
const isVercelRuntime = (): boolean => readEnvText(process.env.VERCEL, EMPTY_TEXT).length > 0;

/**
 * Every value has a default, so the application boots on a freshly cloned
 * repository with no `.env` file and no environment variable at all.
 */
export const loadConfiguration = (): AppConfiguration => ({
  port: readEnvNumber(process.env.PORT, DEFAULT_PORT),
  graphqlPath: readEnvText(process.env.GRAPHQL_PATH, DEFAULT_GRAPHQL_PATH),
  profileSlug: readEnvText(process.env.PROFILE_SLUG, DEFAULT_PROFILE_SLUG),
  database: {
    url: readEnvText(process.env.DATABASE_URL, DEFAULT_DATABASE_URL),
    copyToTmp: isVercelRuntime() || isTruthyFlag(process.env.DATABASE_COPY_TO_TMP),
    tmpPath: readEnvText(process.env.DATABASE_TMP_PATH, DEFAULT_DATABASE_TMP_PATH),
    logQueries: isTruthyFlag(process.env.PRISMA_LOG_QUERIES),
  },
});
