export const DEFAULT_PORT = 3000;
export const DEFAULT_GRAPHQL_PATH = '/';
export const DEFAULT_DATABASE_URL = 'file:./card.db';

const DEFAULT_PROFILE_SLUG = 'stepan-turchenko';
const DEFAULT_DATABASE_TMP_PATH = '/tmp/card.db';
const DECIMAL_RADIX = 10;
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

const isTruthyFlag = (value: string | undefined): boolean => {
  if (value === undefined) {
    return false;
  }
  return TRUTHY_FLAG_VALUES.includes(value);
};

export const loadConfiguration = (): AppConfiguration => ({
  port: Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), DECIMAL_RADIX),
  graphqlPath: process.env.GRAPHQL_PATH ?? DEFAULT_GRAPHQL_PATH,
  profileSlug: process.env.PROFILE_SLUG ?? DEFAULT_PROFILE_SLUG,
  database: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    copyToTmp: Boolean(process.env.VERCEL) || isTruthyFlag(process.env.DATABASE_COPY_TO_TMP),
    tmpPath: process.env.DATABASE_TMP_PATH ?? DEFAULT_DATABASE_TMP_PATH,
    logQueries: isTruthyFlag(process.env.PRISMA_LOG_QUERIES),
  },
});
