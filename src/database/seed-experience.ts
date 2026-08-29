import { PrismaClient } from '@prisma/client';

import { SeedExperience } from './seed.types';

const syncAchievements = async (
  prisma: PrismaClient,
  experienceId: string,
  achievements: readonly string[],
): Promise<void> => {
  for (const [index, text] of achievements.entries()) {
    await prisma.achievement.upsert({
      where: { experienceId_text: { experienceId, text } },
      create: { experienceId, text, sortOrder: index },
      update: { sortOrder: index },
      select: { id: true },
    });
  }
  await prisma.achievement.deleteMany({
    where: { experienceId, text: { notIn: [...achievements] } },
  });
};

export const syncSeedExperience = async (
  prisma: PrismaClient,
  profileId: string,
  positions: readonly SeedExperience[],
): Promise<void> => {
  for (const [index, workplace] of positions.entries()) {
    const payload = {
      periodStart: workplace.periodStart,
      periodEnd: workplace.periodEnd,
      sortOrder: index,
    };
    const row = await prisma.experience.upsert({
      where: {
        profileId_company_position: {
          profileId,
          company: workplace.company,
          position: workplace.position,
        },
      },
      create: {
        profileId,
        company: workplace.company,
        position: workplace.position,
        ...payload,
      },
      update: payload,
      select: { id: true },
    });
    await syncAchievements(prisma, row.id, workplace.achievements);
  }
  // A row is written by company plus position, so it has to be removed by the
  // same pair: matching on the company alone keeps the previous row alive after
  // a promotion inside one company.
  await prisma.experience.deleteMany({
    where: {
      profileId,
      NOT: {
        OR: positions.map((seedPosition) => ({
          company: seedPosition.company,
          position: seedPosition.position,
        })),
      },
    },
  });
};
