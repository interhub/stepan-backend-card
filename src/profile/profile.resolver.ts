import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ExperienceLoader } from '../experience/experience.loader';
import { ExperienceType } from '../experience/graphql/experience.type';
import { LinkType } from '../link/graphql/link.type';
import { LinkLoader } from '../link/link.loader';
import { ProjectType } from '../project/graphql/project.type';
import { ProjectLoader } from '../project/project.loader';
import { SkillType } from '../skill/graphql/skill.type';
import { SkillLoader } from '../skill/skill.loader';
import { ProfileType } from './graphql/profile.type';
import { ProfileService } from './profile.service';

/**
 * Transport layer only: it validates arguments, delegates to services and
 * resolves relations through per-request DataLoaders. No Prisma access here.
 */
@Resolver(() => ProfileType)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillLoader: SkillLoader,
    private readonly experienceLoader: ExperienceLoader,
    private readonly projectLoader: ProjectLoader,
    private readonly linkLoader: LinkLoader,
  ) {}

  @Query(() => ProfileType, { description: 'The digital business card.' })
  profile(
    @Args('slug', { type: () => String, nullable: true }) slug?: string,
  ): Promise<ProfileType> {
    return this.profileService.getOne(slug);
  }

  @Query(() => [ProfileType], { description: 'Every card stored in the database.' })
  profiles(): Promise<ProfileType[]> {
    return this.profileService.findMany();
  }

  @ResolveField(() => [SkillType])
  skills(@Parent() profile: ProfileType): Promise<SkillType[]> {
    return this.skillLoader.byProfileId.load(profile.id);
  }

  @ResolveField(() => [ExperienceType])
  experience(@Parent() profile: ProfileType): Promise<ExperienceType[]> {
    return this.experienceLoader.byProfileId.load(profile.id);
  }

  @ResolveField(() => [ProjectType])
  projects(@Parent() profile: ProfileType): Promise<ProjectType[]> {
    return this.projectLoader.byProfileId.load(profile.id);
  }

  @ResolveField(() => [LinkType])
  links(@Parent() profile: ProfileType): Promise<LinkType[]> {
    return this.linkLoader.byProfileId.load(profile.id);
  }
}
