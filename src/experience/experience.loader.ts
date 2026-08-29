import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { ExperienceService } from './experience.service';
import { ExperienceType } from './graphql/experience.type';

@Injectable({ scope: Scope.REQUEST })
export class ExperienceLoader {
  readonly byProfileId: DataLoader<string, ExperienceType[]>;
  /** Without this loader every position would trigger its own achievements query. */
  readonly achievementsByExperienceId: DataLoader<string, string[]>;

  constructor(private readonly service: ExperienceService) {
    this.byProfileId = new DataLoader<string, ExperienceType[]>((profileIds) =>
      this.service.findManyByProfileIds(profileIds),
    );
    this.achievementsByExperienceId = new DataLoader<string, string[]>((experienceIds) =>
      this.service.findManyAchievementsByExperienceIds(experienceIds),
    );
  }
}
