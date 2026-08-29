import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { ProjectType } from './graphql/project.type';
import { ProjectService } from './project.service';

@Injectable({ scope: Scope.REQUEST })
export class ProjectLoader {
  readonly byProfileId: DataLoader<string, ProjectType[]>;
  /** Without this loader every project would trigger its own results query. */
  readonly resultsByProjectId: DataLoader<string, string[]>;

  constructor(private readonly service: ProjectService) {
    this.byProfileId = new DataLoader<string, ProjectType[]>((profileIds) =>
      this.service.findManyByProfileIds(profileIds),
    );
    this.resultsByProjectId = new DataLoader<string, string[]>((projectIds) =>
      this.service.findManyResultsByProjectIds(projectIds),
    );
  }
}
