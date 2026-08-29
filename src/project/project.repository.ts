import { Injectable, Logger } from '@nestjs/common';
import { ProjectItem, ProjectResult } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type ProjectRow = Pick<
  ProjectItem,
  | 'id'
  | 'name'
  | 'description'
  | 'url'
  | 'role'
  | 'periodStart'
  | 'periodEnd'
  | 'tags'
  | 'profileId'
>;

export type ProjectResultRow = Pick<ProjectResult, 'text' | 'projectId'>;

@Injectable()
export class ProjectRepository {
  private readonly logger = new Logger(ProjectRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<ProjectRow[]> {
    try {
      return await this.prisma.projectItem.findMany({
        where: { profileId: { in: [...profileIds] } },
        // The most recently started project comes first; SQLite puts the rows
        // with no start date at the end of a descending sort.
        orderBy: [{ periodStart: 'desc' }, { sortOrder: 'asc' }],
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
          role: true,
          periodStart: true,
          periodEnd: true,
          tags: true,
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

  async findManyResultsByProjectIds(projectIds: readonly string[]): Promise<ProjectResultRow[]> {
    try {
      return await this.prisma.projectResult.findMany({
        where: { projectId: { in: [...projectIds] } },
        orderBy: [{ sortOrder: 'asc' }],
        select: { text: true, projectId: true },
      });
    } catch (error) {
      this.logger.error(
        `findManyResultsByProjectIds failed for ${projectIds.length} project ids`,
        describeErrorStack(error),
      );
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }
}
