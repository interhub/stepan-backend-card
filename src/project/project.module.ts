import { Module } from '@nestjs/common';

import { ProjectLoader } from './project.loader';
import { ProjectRepository } from './project.repository';
import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';

@Module({
  providers: [ProjectRepository, ProjectService, ProjectLoader, ProjectResolver],
  exports: [ProjectLoader, ProjectService],
})
export class ProjectModule {}
