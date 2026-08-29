import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { ProjectType } from './graphql/project.type';
import { ProjectService } from './project.service';

@Injectable({ scope: Scope.REQUEST })
export class ProjectLoader {
  readonly byProfileId: DataLoader<string, ProjectType[]>;

  constructor(private readonly service: ProjectService) {
    this.byProfileId = new DataLoader<string, ProjectType[]>((profileIds) =>
      this.service.findManyByProfileIds(profileIds),
    );
  }
}
