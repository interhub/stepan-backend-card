import { PrismaClient } from '@prisma/client';

import { SeedSkill } from './seed.types';

export const syncSeedSkills = async (
  prisma: PrismaClient,
  profileId: string,
  skills: readonly SeedSkill[],
): Promise<void> => {
  for (const [index, skill] of skills.entries()) {
    const payload = { category: skill.category, level: skill.level, sortOrder: index };
    await prisma.skill.upsert({
      where: { profileId_name: { profileId, name: skill.name } },
      create: { profileId, name: skill.name, ...payload },
      update: payload,
      select: { id: true },
    });
  }
  await prisma.skill.deleteMany({
    where: { profileId, name: { notIn: skills.map((seedSkill) => seedSkill.name) } },
  });
};
