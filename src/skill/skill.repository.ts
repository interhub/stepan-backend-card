import { Injectable, Logger } from '@nestjs/common';
import { Skill } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type SkillRow = Pick<Skill, 'id' | 'name' | 'category' | 'level' | 'profileId'>;

@Injectable()
export class SkillRepository {
  private readonly logger = new Logger(SkillRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** One query for every profile id collected by DataLoader within a tick. */
  async findManyByProfileIds(profileIds: readonly string[]): Promise<SkillRow[]> {
    try {
      return await this.prisma.skill.findMany({
        where: { profileId: { in: [...profileIds] } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, category: true, level: true, profileId: true },
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
