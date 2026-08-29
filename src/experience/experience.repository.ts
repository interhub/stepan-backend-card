import { Injectable, Logger } from '@nestjs/common';
import { Achievement, Experience } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type ExperienceRow = Pick<
  Experience,
  'id' | 'company' | 'position' | 'periodStart' | 'periodEnd' | 'profileId'
>;

export type AchievementRow = Pick<Achievement, 'text' | 'experienceId'>;

@Injectable()
export class ExperienceRepository {
  private readonly logger = new Logger(ExperienceRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<ExperienceRow[]> {
    try {
      return await this.prisma.experience.findMany({
        where: { profileId: { in: [...profileIds] } },
        orderBy: [{ sortOrder: 'asc' }],
        select: {
          id: true,
          company: true,
          position: true,
          periodStart: true,
          periodEnd: true,
          profileId: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `findManyByProfileIds failed for ${profileIds.length} profile ids`,
        describeErrorStack(error),
      );
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }

  async findManyAchievementsByExperienceIds(
    experienceIds: readonly string[],
  ): Promise<AchievementRow[]> {
    try {
      return await this.prisma.achievement.findMany({
        where: { experienceId: { in: [...experienceIds] } },
        orderBy: [{ sortOrder: 'asc' }],
        select: { text: true, experienceId: true },
      });
    } catch (error) {
      this.logger.error(
        `findManyAchievementsByExperienceIds failed for ${experienceIds.length} experience ids`,
        describeErrorStack(error),
      );
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }
}
