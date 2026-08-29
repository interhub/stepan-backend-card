import { Injectable } from '@nestjs/common';

import { groupByKey } from '../common/group-by';
import { SkillType } from './graphql/skill.type';
import { SkillRepository, SkillRow } from './skill.repository';

const toGraphqlSkill = (row: SkillRow): SkillType => ({
  id: row.id,
  name: row.name,
  category: row.category,
  level: row.level,
});

@Injectable()
export class SkillService {
  constructor(private readonly repository: SkillRepository) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<SkillType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(toGraphqlSkill),
    );
  }
}
