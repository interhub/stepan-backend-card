import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { LinkType } from './graphql/link.type';
import { LinkService } from './link.service';

@Injectable({ scope: Scope.REQUEST })
export class LinkLoader {
  readonly byProfileId: DataLoader<string, LinkType[]>;

  constructor(private readonly service: LinkService) {
    this.byProfileId = new DataLoader<string, LinkType[]>((profileIds) =>
      this.service.findManyByProfileIds(profileIds),
    );
  }
}
