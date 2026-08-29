import { Module } from '@nestjs/common';

import { ProjectLoader } from './project.loader';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';

@Module({
  providers: [ProjectRepository, ProjectService, ProjectLoader],
  exports: [ProjectLoader, ProjectService],
})
export class ProjectModule {}
