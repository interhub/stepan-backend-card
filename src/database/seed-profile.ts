import { PrismaClient } from '@prisma/client';

import { joinLabels } from '../common/labels';
import { SeedProfile } from './seed.types';

/** Returns the id of the upserted card, every other seed step hangs off it. */
export const upsertSeedProfile = async (
  prisma: PrismaClient,
  slug: string,
  profile: SeedProfile,
): Promise<string> => {
  const payload = {
    name: profile.name,
    title: profile.title,
    description: profile.summary,
    location: profile.location,
    email: profile.email,
    languages: joinLabels(profile.languages),
  };
  const row = await prisma.profile.upsert({
    where: { slug },
    create: { slug, ...payload },
    update: payload,
    select: { id: true },
  });
  return row.id;
};
