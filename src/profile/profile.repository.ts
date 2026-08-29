import { Injectable, Logger } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { DATABASE_QUERY_FAILED_MESSAGE, describeErrorStack } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export type ProfileRow = Pick<
  Profile,
  'id' | 'slug' | 'name' | 'title' | 'description' | 'location' | 'email' | 'languages'
>;

const PROFILE_SELECT = {
  id: true,
  slug: true,
  name: true,
  title: true,
  description: true,
  location: true,
  email: true,
  languages: true,
} as const;

@Injectable()
export class ProfileRepository {
  private readonly logger = new Logger(ProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOneBySlug(slug: string): Promise<ProfileRow | null> {
    try {
      return await this.prisma.profile.findUnique({ where: { slug }, select: PROFILE_SELECT });
    } catch (error) {
      this.logger.error(`findOneBySlug failed for slug "${slug}"`, describeErrorStack(error));
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }

  /** The oldest card is the default one when the query carries no slug. */
  async findOneOldest(): Promise<ProfileRow | null> {
    try {
      return await this.prisma.profile.findFirst({
        orderBy: { createdAt: 'asc' },
        select: PROFILE_SELECT,
      });
    } catch (error) {
      this.logger.error('findOneOldest failed', describeErrorStack(error));
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }

  async findMany(): Promise<ProfileRow[]> {
    try {
      return await this.prisma.profile.findMany({
        orderBy: { createdAt: 'asc' },
        select: PROFILE_SELECT,
      });
    } catch (error) {
      this.logger.error('findMany failed', describeErrorStack(error));
      throw new Error(DATABASE_QUERY_FAILED_MESSAGE);
    }
  }
}
