import { PrismaClient } from '@prisma/client';

import { joinLabels } from '../common/labels';
import { SeedProject } from './seed.types';

export const syncSeedProjects = async (
  prisma: PrismaClient,
  profileId: string,
  projects: readonly SeedProject[],
): Promise<void> => {
  for (const [index, project] of projects.entries()) {
    const payload = {
      description: project.description,
      url: project.url,
      tags: joinLabels(project.tags),
      sortOrder: index,
    };
    await prisma.projectItem.upsert({
      where: { profileId_name: { profileId, name: project.name } },
      create: { profileId, name: project.name, ...payload },
      update: payload,
      select: { id: true },
    });
  }
  await prisma.projectItem.deleteMany({
    where: { profileId, name: { notIn: projects.map((seedProject) => seedProject.name) } },
  });
};
