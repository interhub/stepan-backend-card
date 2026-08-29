import { Module } from '@nestjs/common';

import { ExperienceLoader } from './experience.loader';
import { ExperienceRepository } from './experience.repository';
import { ExperienceResolver } from './experience.resolver';
import { ExperienceService } from './experience.service';

@Module({
  providers: [ExperienceRepository, ExperienceService, ExperienceLoader, ExperienceResolver],
  exports: [ExperienceLoader, ExperienceService],
})
export class ExperienceModule {}
