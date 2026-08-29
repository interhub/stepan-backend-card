import { Injectable } from '@nestjs/common';

import { groupByKey } from '../common/group-by';
import { splitLabels } from '../common/labels';
import { ProjectType } from './graphql/project.type';
import { ProjectRepository, ProjectRow } from './project.repository';

const toGraphqlProject = (row: ProjectRow): ProjectType => ({
  id: row.id,
  name: row.name,
  description: row.description,
  url: row.url,
  tags: splitLabels(row.tags),
});

@Injectable()
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<ProjectType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(toGraphqlProject),
    );
  }
}
