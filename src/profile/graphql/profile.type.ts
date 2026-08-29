import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Profile', { description: 'The digital business card owner.' })
export class ProfileType {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Stable human readable identifier used to look the card up.' })
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { description: 'Headline shown under the name.' })
  title: string;

  @Field(() => String, { description: 'Long form summary of the professional background.' })
  description: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  email: string;

  @Field(() => [String])
  languages: string[];

  // skills, experience, projects and links are served by @ResolveField.
}
