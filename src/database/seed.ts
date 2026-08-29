import { readFileSync } from 'node:fs';

import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { describeErrorStack } from '../common/errors';
import { resolveSeedDataFile } from '../common/paths';
import { DatabaseConfiguration, loadConfiguration } from '../config/configuration';
import { resolveRuntimeDatabaseUrl } from '../prisma/database-file';
import { syncSeedExperience } from './seed-experience';
import { syncSeedLinks } from './seed-links';
import { upsertSeedProfile } from './seed-profile';
import { syncSeedProjects } from './seed-projects';
import { syncSeedSkills } from './seed-skills';
import { SeedCounts, SeedFile } from './seed.types';

const SEED_LOGGER_CONTEXT = 'DatabaseSeed';
const SEED_FILE_ENCODING = 'utf8';
const SEED_FAILURE_EXIT_CODE = 1;

const logger = new Logger(SEED_LOGGER_CONTEXT);

const readSeedFile = (): SeedFile =>
  JSON.parse(readFileSync(resolveSeedDataFile(), SEED_FILE_ENCODING)) as SeedFile;

/** Seeding always writes the bundled file directly, the /tmp copy is a runtime concern. */
const createSeedClient = (database: DatabaseConfiguration): PrismaClient =>
  new PrismaClient({
    datasourceUrl: resolveRuntimeDatabaseUrl({ ...database, copyToTmp: false }),
  });

const countSeededRows = async (prisma: PrismaClient, profileId: string): Promise<SeedCounts> => {
  const [skills, experience, achievements, projects, projectResults, links] = await Promise.all([
    prisma.skill.count({ where: { profileId } }),
    prisma.experience.count({ where: { profileId } }),
    prisma.achievement.count({ where: { experience: { profileId } } }),
    prisma.projectItem.count({ where: { profileId } }),
    prisma.projectResult.count({ where: { project: { profileId } } }),
    prisma.link.count({ where: { profileId } }),
  ]);
  return { skills, experience, achievements, projects, projectResults, links };
};

/**
 * Idempotent by design: every row is addressed by a natural unique key and the
 * rows that disappeared from the seed file are removed afterwards, so running
 * this twice leaves the database in exactly the same state.
 */
const seed = async (): Promise<void> => {
  const configuration = loadConfiguration();
  const data = readSeedFile();
  const prisma = createSeedClient(configuration.database);
  try {
    const slug = configuration.profileSlug;
    const profileId = await upsertSeedProfile(prisma, slug, data.profile);
    await syncSeedSkills(prisma, profileId, data.skills);
    await syncSeedExperience(prisma, profileId, data.experience);
    await syncSeedProjects(prisma, profileId, data.projects);
    await syncSeedLinks(prisma, profileId, data.profile.links);
    const counts = await countSeededRows(prisma, profileId);
    logger.log(
      `Seeded profile "${slug}": ${counts.skills} skills, ${counts.experience} positions, ` +
        `${counts.achievements} achievements, ${counts.projects} projects, ` +
        `${counts.projectResults} project results, ${counts.links} links`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

const runSeed = async (): Promise<void> => {
  try {
    await seed();
  } catch (error) {
    logger.error('seed failed', describeErrorStack(error));
    process.exit(SEED_FAILURE_EXIT_CODE);
  }
};

void runSeed();
