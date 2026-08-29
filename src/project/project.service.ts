import { Injectable } from '@nestjs/common';
import { ProjectItem } from '@prisma/client';

import { groupByKey, splitLabels } from '../common/group-by';
import { ProjectType } from './graphql/project.type';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<ProjectType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(ProjectService.toGraphql),
    );
  }

  private static toGraphql(row: ProjectItem): ProjectType {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      tags: splitLabels(row.tags),
    };
  }
}
