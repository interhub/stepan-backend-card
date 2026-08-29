import { Injectable } from '@nestjs/common';

import { groupByKey } from '../common/group-by';
import { ExperienceRepository, ExperienceRow } from './experience.repository';
import { ExperienceType } from './graphql/experience.type';

const toGraphqlExperience = (row: ExperienceRow): ExperienceType => ({
  id: row.id,
  company: row.company,
  position: row.position,
  periodStart: row.periodStart,
  periodEnd: row.periodEnd,
});

@Injectable()
export class ExperienceService {
  constructor(private readonly repository: ExperienceRepository) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<ExperienceType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(toGraphqlExperience),
    );
  }

  async findManyAchievementsByExperienceIds(experienceIds: readonly string[]): Promise<string[][]> {
    const rows = await this.repository.findManyAchievementsByExperienceIds(experienceIds);
    return groupByKey(rows, experienceIds, (row) => row.experienceId).map((bucket) =>
      bucket.map((row) => row.text),
    );
  }
}
