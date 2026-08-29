import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { SkillType } from './graphql/skill.type';
import { SkillService } from './skill.service';

/**
 * Request scoped on purpose: batching and caching must never leak between
 * two different GraphQL requests.
 */
@Injectable({ scope: Scope.REQUEST })
export class SkillLoader {
  readonly byProfileId: DataLoader<string, SkillType[]>;

  constructor(private readonly service: SkillService) {
    this.byProfileId = new DataLoader<string, SkillType[]>((profileIds) =>
      this.service.findByProfileIds(profileIds),
    );
  }
}
