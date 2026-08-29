import { Injectable, Logger } from '@nestjs/common';
import { Link } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type LinkRow = Pick<Link, 'id' | 'label' | 'url' | 'profileId'>;

@Injectable()
export class LinkRepository {
  private readonly logger = new Logger(LinkRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<LinkRow[]> {
    try {
      return await this.prisma.link.findMany({
        where: { profileId: { in: [...profileIds] } },
        orderBy: [{ sortOrder: 'asc' }],
        select: { id: true, label: true, url: true, profileId: true },
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
