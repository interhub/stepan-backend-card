import { Injectable } from '@nestjs/common';

import { groupByKey } from '../common/group-by';
import { LinkType } from './graphql/link.type';
import { LinkRepository, LinkRow } from './link.repository';

const toGraphqlLink = (row: LinkRow): LinkType => ({
  id: row.id,
  label: row.label,
  url: row.url,
});

@Injectable()
export class LinkService {
  constructor(private readonly repository: LinkRepository) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<LinkType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(toGraphqlLink),
    );
  }
}
