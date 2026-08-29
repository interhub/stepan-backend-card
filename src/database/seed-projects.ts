import { PrismaClient } from '@prisma/client';

import { joinLabels } from '../common/labels';
import { SeedProject } from './seed.types';

const syncProjectResults = async (
  prisma: PrismaClient,
  projectId: string,
  results: readonly string[],
): Promise<void> => {
  for (const [index, text] of results.entries()) {
    await prisma.projectResult.upsert({
      where: { projectId_text: { projectId, text } },
      create: { projectId, text, sortOrder: index },
      update: { sortOrder: index },
      select: { id: true },
    });
  }
  await prisma.projectResult.deleteMany({
    where: { projectId, text: { notIn: [...results] } },
  });
};

export const syncSeedProjects = async (
  prisma: PrismaClient,
  profileId: string,
  projects: readonly SeedProject[],
): Promise<void> => {
  for (const [index, project] of projects.entries()) {
    const payload = {
      description: project.description,
      url: project.url,
      role: project.role,
      periodStart: project.periodStart,
      periodEnd: project.periodEnd,
      tags: joinLabels(project.tags),
      sortOrder: index,
    };
    const row = await prisma.projectItem.upsert({
      where: { profileId_name: { profileId, name: project.name } },
      create: { profileId, name: project.name, ...payload },
      update: payload,
      select: { id: true },
    });
    await syncProjectResults(prisma, row.id, project.results);
  }
  await prisma.projectItem.deleteMany({
    where: { profileId, name: { notIn: projects.map((seedProject) => seedProject.name) } },
  });
};
