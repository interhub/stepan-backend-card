import { copyFileSync, existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { prismaDir } from '../common/paths';

const FILE_PREFIX = 'file:';

/** Prisma resolves relative SQLite paths against the schema folder. */
export const toAbsoluteDatabasePath = (url: string): string => {
  const raw = url.startsWith(FILE_PREFIX) ? url.slice(FILE_PREFIX.length) : url;
  return isAbsolute(raw) ? raw : resolve(prismaDir(), raw);
};

export interface DatabaseFileOptions {
  url: string;
  copyToTmp: boolean;
  tmpPath: string;
}

/**
 * Returns the connection string the Prisma client should actually use.
 * On Vercel the bundled database file is copied to /tmp once per cold start,
 * because the lambda file system is read-only everywhere else.
 */
export const resolveRuntimeDatabaseUrl = (options: DatabaseFileOptions): string => {
  const source = toAbsoluteDatabasePath(options.url);

  if (!options.copyToTmp) {
    return `${FILE_PREFIX}${source}`;
  }

  if (!existsSync(options.tmpPath)) {
    if (!existsSync(source)) {
      throw new Error(
        `Bundled SQLite file is missing at "${source}". Run "npm run db:prepare" and commit prisma/card.db before deploying.`,
      );
    }
    copyFileSync(source, options.tmpPath);
  }

  return `${FILE_PREFIX}${options.tmpPath}`;
};
