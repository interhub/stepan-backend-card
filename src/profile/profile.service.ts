import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { splitLabels } from '../common/group-by';
import { ProfileType } from './graphql/profile.type';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /** Without a slug the card falls back to the only profile stored in the database. */
  async findOne(slug?: string): Promise<ProfileType> {
    const row = slug ? await this.repository.findBySlug(slug) : await this.repository.findFirst();

    if (!row) {
      throw new NotFoundException(
        slug ? `Profile "${slug}" was not found` : 'The database contains no profile yet',
      );
    }

    return ProfileService.toGraphql(row);
  }

  async findAll(): Promise<ProfileType[]> {
    const rows = await this.repository.findAll();
    return rows.map(ProfileService.toGraphql);
  }

  private static toGraphql(row: Profile): ProfileType {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      title: row.title,
      description: row.description,
      location: row.location,
      email: row.email,
      languages: splitLabels(row.languages),
    };
  }
}
