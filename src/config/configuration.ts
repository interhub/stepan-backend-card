export interface AppConfiguration {
  port: number;
  graphqlPath: string;
  profileSlug: string;
  database: {
    url: string;
    /**
     * Serverless runtimes expose a read-only file system with the single
     * exception of /tmp, so the SQLite file has to be copied there first.
     */
    copyToTmp: boolean;
    tmpPath: string;
    /** Prints every generated SQL statement, handy to prove the N+1 fix. */
    logQueries: boolean;
  };
}

const toBoolean = (value: string | undefined): boolean =>
  value === 'true' || value === '1' || value === 'yes';

export const configuration = (): AppConfiguration => ({
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  graphqlPath: process.env.GRAPHQL_PATH ?? '/',
  profileSlug: process.env.PROFILE_SLUG ?? 'stepan-turchenko',
  database: {
    url: process.env.DATABASE_URL ?? 'file:./card.db',
    copyToTmp: Boolean(process.env.VERCEL) || toBoolean(process.env.DATABASE_COPY_TO_TMP),
    tmpPath: process.env.DATABASE_TMP_PATH ?? '/tmp/card.db',
    logQueries: toBoolean(process.env.PRISMA_LOG_QUERIES),
  },
});
