import { Injectable } from '@nestjs/common';
import { Skill } from '@prisma/client';

import { groupByKey } from '../common/group-by';
import { SkillType } from './graphql/skill.type';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(private readonly repository: SkillRepository) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<SkillType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(SkillService.toGraphql),
    );
  }

  private static toGraphql(row: Skill): SkillType {
    return { id: row.id, name: row.name, category: row.category, level: row.level };
  }
}
