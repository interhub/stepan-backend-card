import { Module } from '@nestjs/common';

import { SkillLoader } from './skill.loader';
import { SkillRepository } from './skill.repository';
import { SkillService } from './skill.service';

@Module({
  providers: [SkillRepository, SkillService, SkillLoader],
  exports: [SkillLoader, SkillService],
})
export class SkillModule {}
