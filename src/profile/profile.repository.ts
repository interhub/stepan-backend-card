import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findFirst(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany({ orderBy: { createdAt: 'asc' } });
  }
}
