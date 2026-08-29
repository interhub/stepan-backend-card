import { resolve } from 'node:path';

/**
 * Compiled sources live in <root>/dist/<layer>/<file>.js, so the project root
 * is always two levels above this file at runtime.
 */
export const projectRoot = (): string => resolve(__dirname, '..', '..');

export const prismaDir = (): string => resolve(projectRoot(), 'prisma');

export const seedDataFile = (): string => resolve(projectRoot(), 'data', 'profile-seed.json');
