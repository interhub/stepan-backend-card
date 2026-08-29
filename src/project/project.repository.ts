import { Injectable, Logger } from '@nestjs/common';
import { ProjectItem } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type ProjectRow = Pick<
  ProjectItem,
  'id' | 'name' | 'description' | 'url' | 'tags' | 'profileId'
>;

@Injectable()
export class ProjectRepository {
  private readonly logger = new Logger(ProjectRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<ProjectRow[]> {
    try {
      return await this.prisma.projectItem.findMany({
        where: { profileId: { in: [...profileIds] } },
        orderBy: [{ sortOrder: 'asc' }],
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
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
}
