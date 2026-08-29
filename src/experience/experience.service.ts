import { Injectable } from '@nestjs/common';
import { Achievement, Experience } from '@prisma/client';

import { groupByKey } from '../common/group-by';
import { ExperienceRepository } from './experience.repository';
import { ExperienceType } from './graphql/experience.type';

@Injectable()
export class ExperienceService {
  constructor(private readonly repository: ExperienceRepository) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<ExperienceType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(ExperienceService.toGraphql),
    );
  }

  async findAchievementsByExperienceIds(experienceIds: readonly string[]): Promise<string[][]> {
    const rows = await this.repository.findAchievementsByExperienceIds(experienceIds);
    return groupByKey(rows, experienceIds, (row: Achievement) => row.experienceId).map((bucket) =>
      bucket.map((row) => row.text),
    );
  }

  private static toGraphql(row: Experience): ExperienceType {
    return {
      id: row.id,
      company: row.company,
      position: row.position,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
    };
  }
}
