import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project', { description: 'A product the profile owner built or led.' })
export class ProjectType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { description: 'The part the profile owner took on the project.' })
  role: string;

  @Field(() => String, {
    nullable: true,
    description: 'Start of the period in YYYY-MM format, null when the date is not confirmed.',
  })
  periodStart: string | null;

  @Field(() => String, {
    nullable: true,
    description:
      'End of the period in YYYY-MM format, null while the project runs or when the date is not confirmed.',
  })
  periodEnd: string | null;

  @Field(() => [String], { description: 'Stack and role labels.' })
  tags: string[];

  // results is served by @ResolveField through a DataLoader.
}
