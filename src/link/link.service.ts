import { Injectable } from '@nestjs/common';
import { Link } from '@prisma/client';

import { groupByKey } from '../common/group-by';
import { LinkType } from './graphql/link.type';
import { LinkRepository } from './link.repository';

@Injectable()
export class LinkService {
  constructor(private readonly repository: LinkRepository) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<LinkType[][]> {
    const rows = await this.repository.findManyByProfileIds(profileIds);
    return groupByKey(rows, profileIds, (row) => row.profileId).map((bucket) =>
      bucket.map(LinkService.toGraphql),
    );
  }

  private static toGraphql(row: Link): LinkType {
    return { id: row.id, label: row.label, url: row.url };
  }
}
