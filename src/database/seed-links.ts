import { PrismaClient } from '@prisma/client';

import { SeedProfileLink } from './seed.types';

export const syncSeedLinks = async (
  prisma: PrismaClient,
  profileId: string,
  links: readonly SeedProfileLink[],
): Promise<void> => {
  for (const [index, link] of links.entries()) {
    const payload = { url: link.url, sortOrder: index };
    await prisma.link.upsert({
      where: { profileId_label: { profileId, label: link.label } },
      create: { profileId, label: link.label, ...payload },
      update: payload,
      select: { id: true },
    });
  }
  await prisma.link.deleteMany({
    where: { profileId, label: { notIn: links.map((seedLink) => seedLink.label) } },
  });
};
