import { readFileSync } from 'node:fs';

import { PrismaClient } from '@prisma/client';

import { joinLabels } from '../common/group-by';
import { seedDataFile } from '../common/paths';
import { resolveRuntimeDatabaseUrl } from '../prisma/database-file';
import { SeedFile } from './seed.types';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Idempotent by design: every row is addressed by a natural unique key and the
 * rows that disappeared from the seed file are removed afterwards, so running
 * this twice leaves the database in exactly the same state.
 */
async function seed(): Promise<void> {
  const data = JSON.parse(readFileSync(seedDataFile(), 'utf8')) as SeedFile;
  const slug = process.env.PROFILE_SLUG ?? slugify(data.profile.name);

  const prisma = new PrismaClient({
    datasourceUrl: resolveRuntimeDatabaseUrl({
      url: process.env.DATABASE_URL ?? 'file:./card.db',
      copyToTmp: false,
      tmpPath: '/tmp/card.db',
    }),
  });

  try {
    const profilePayload = {
      name: data.profile.name,
      title: data.profile.title,
      description: data.profile.summary,
      location: data.profile.location,
      email: data.profile.email,
      languages: joinLabels(data.profile.languages),
    };

    const profile = await prisma.profile.upsert({
      where: { slug },
      create: { slug, ...profilePayload },
      update: profilePayload,
    });

    for (const [index, skill] of data.skills.entries()) {
      const payload = { category: skill.category, level: skill.level, sortOrder: index };
      await prisma.skill.upsert({
        where: { profileId_name: { profileId: profile.id, name: skill.name } },
        create: { profileId: profile.id, name: skill.name, ...payload },
        update: payload,
      });
    }
    await prisma.skill.deleteMany({
      where: { profileId: profile.id, name: { notIn: data.skills.map((item) => item.name) } },
    });

    for (const [index, item] of data.experience.entries()) {
      const payload = {
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
        sortOrder: index,
      };
      const experience = await prisma.experience.upsert({
        where: {
          profileId_company_position: {
            profileId: profile.id,
            company: item.company,
            position: item.position,
          },
        },
        create: {
          profileId: profile.id,
          company: item.company,
          position: item.position,
          ...payload,
        },
        update: payload,
      });

      for (const [achievementIndex, text] of item.achievements.entries()) {
        await prisma.achievement.upsert({
          where: { experienceId_text: { experienceId: experience.id, text } },
          create: { experienceId: experience.id, text, sortOrder: achievementIndex },
          update: { sortOrder: achievementIndex },
        });
      }
      await prisma.achievement.deleteMany({
        where: { experienceId: experience.id, text: { notIn: item.achievements } },
      });
    }
    await prisma.experience.deleteMany({
      where: {
        profileId: profile.id,
        company: { notIn: data.experience.map((item) => item.company) },
      },
    });

    for (const [index, project] of data.projects.entries()) {
      const payload = {
        description: project.description,
        url: project.url,
        tags: joinLabels(project.tags),
        sortOrder: index,
      };
      await prisma.projectItem.upsert({
        where: { profileId_name: { profileId: profile.id, name: project.name } },
        create: { profileId: profile.id, name: project.name, ...payload },
        update: payload,
      });
    }
    await prisma.projectItem.deleteMany({
      where: { profileId: profile.id, name: { notIn: data.projects.map((item) => item.name) } },
    });

    for (const [index, link] of data.profile.links.entries()) {
      const payload = { url: link.url, sortOrder: index };
      await prisma.link.upsert({
        where: { profileId_label: { profileId: profile.id, label: link.label } },
        create: { profileId: profile.id, label: link.label, ...payload },
        update: payload,
      });
    }
    await prisma.link.deleteMany({
      where: {
        profileId: profile.id,
        label: { notIn: data.profile.links.map((item) => item.label) },
      },
    });

    const counts = {
      skills: await prisma.skill.count({ where: { profileId: profile.id } }),
      experience: await prisma.experience.count({ where: { profileId: profile.id } }),
      achievements: await prisma.achievement.count(),
      projects: await prisma.projectItem.count({ where: { profileId: profile.id } }),
      links: await prisma.link.count({ where: { profileId: profile.id } }),
    };

    // eslint-disable-next-line no-console
    console.log(`Seeded profile "${slug}"`, counts);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed:', error);
  process.exit(1);
});
