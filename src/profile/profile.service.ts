import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { splitLabels } from '../common/labels';
import { ProfileType } from './graphql/profile.type';
import { ProfileRepository, ProfileRow } from './profile.repository';

const toGraphqlProfile = (row: ProfileRow): ProfileType => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  title: row.title,
  description: row.description,
  location: row.location,
  email: row.email,
  languages: splitLabels(row.languages),
});

const NOT_FOUND_ERROR_CODE = 'NOT_FOUND';

const buildProfileNotFoundMessage = (slug?: string): string => {
  if (slug) {
    return `Profile "${slug}" was not found`;
  }
  return 'The database contains no profile yet';
};

/**
 * Apollo reports every error that is not a GraphQLError as
 * INTERNAL_SERVER_ERROR, which hides the difference between an unknown slug and
 * a broken database, so the missing card carries its own code.
 */
const buildProfileNotFoundError = (slug?: string): GraphQLError =>
  new GraphQLError(buildProfileNotFoundMessage(slug), {
    extensions: { code: NOT_FOUND_ERROR_CODE },
  });

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /** Without a slug the card falls back to the only profile stored in the database. */
  async getOne(slug?: string): Promise<ProfileType> {
    const row = await this.findOneRow(slug);
    if (!row) {
      throw buildProfileNotFoundError(slug);
    }
    return toGraphqlProfile(row);
  }

  async findMany(): Promise<ProfileType[]> {
    const rows = await this.repository.findMany();
    return rows.map(toGraphqlProfile);
  }

  private findOneRow(slug?: string): Promise<ProfileRow | null> {
    if (slug) {
      return this.repository.findOneBySlug(slug);
    }
    return this.repository.findOneOldest();
  }
}
