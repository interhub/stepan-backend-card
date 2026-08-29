import { copyFileSync, existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { resolvePrismaDir } from '../common/paths';

const FILE_URL_PREFIX = 'file:';

const stripFileUrlPrefix = (url: string): string => {
  if (url.startsWith(FILE_URL_PREFIX)) {
    return url.slice(FILE_URL_PREFIX.length);
  }
  return url;
};

/** Prisma resolves relative SQLite paths against the schema folder. */
const toAbsoluteDatabasePath = (url: string): string => {
  const rawPath = stripFileUrlPrefix(url);
  if (isAbsolute(rawPath)) {
    return rawPath;
  }
  return resolve(resolvePrismaDir(), rawPath);
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
    return `${FILE_URL_PREFIX}${source}`;
  }
  if (existsSync(options.tmpPath)) {
    return `${FILE_URL_PREFIX}${options.tmpPath}`;
  }
  if (!existsSync(source)) {
    throw new Error(
      `Bundled SQLite file is missing at "${source}". Run "npm run db:prepare" and commit prisma/card.db before deploying.`,
    );
  }
  copyFileSync(source, options.tmpPath);
  return `${FILE_URL_PREFIX}${options.tmpPath}`;
};
