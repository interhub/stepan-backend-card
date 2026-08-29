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
  role: row.role,
  periodStart: row.periodStart,
  periodEnd: row.periodEnd,
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

  async findManyResultsByProjectIds(projectIds: readonly string[]): Promise<string[][]> {
    const rows = await this.repository.findManyResultsByProjectIds(projectIds);
    return groupByKey(rows, projectIds, (row) => row.projectId).map((bucket) =>
      bucket.map((row) => row.text),
    );
  }
}
