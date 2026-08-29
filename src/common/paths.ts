import { resolve } from 'node:path';

const PRISMA_DIR_NAME = 'prisma';
const SEED_DATA_DIR_NAME = 'data';
const SEED_DATA_FILE_NAME = 'profile-seed.json';

/**
 * Compiled sources live in <root>/dist/<layer>/<file>.js, so the project root
 * is always two levels above this file at runtime.
 */
export const resolveProjectRoot = (): string => resolve(__dirname, '..', '..');

export const resolvePrismaDir = (): string => resolve(resolveProjectRoot(), PRISMA_DIR_NAME);

export const resolveSeedDataFile = (): string =>
  resolve(resolveProjectRoot(), SEED_DATA_DIR_NAME, SEED_DATA_FILE_NAME);
