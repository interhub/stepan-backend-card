import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ExperienceLoader } from './experience.loader';
import { ExperienceType } from './graphql/experience.type';

@Resolver(() => ExperienceType)
export class ExperienceResolver {
  constructor(private readonly loader: ExperienceLoader) {}

  @ResolveField(() => [String], { description: 'What was actually delivered in this position.' })
  achievements(@Parent() experience: ExperienceType): Promise<string[]> {
    return this.loader.achievementsByExperienceId.load(experience.id);
  }
}
