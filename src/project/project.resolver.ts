import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ProjectType } from './graphql/project.type';
import { ProjectLoader } from './project.loader';

@Resolver(() => ProjectType)
export class ProjectResolver {
  constructor(private readonly loader: ProjectLoader) {}

  @ResolveField(() => [String], { description: 'What the project actually delivered.' })
  results(@Parent() project: ProjectType): Promise<string[]> {
    return this.loader.resultsByProjectId.load(project.id);
  }
}
