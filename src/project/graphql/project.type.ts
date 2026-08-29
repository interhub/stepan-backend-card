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

  @Field(() => [String], { description: 'Stack and role labels.' })
  tags: string[];
}
