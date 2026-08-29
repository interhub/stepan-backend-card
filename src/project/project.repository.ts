import { Injectable } from '@nestjs/common';
import { ProjectItem } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfileIds(profileIds: readonly string[]): Promise<ProjectItem[]> {
    return this.prisma.projectItem.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }],
    });
  }
}
