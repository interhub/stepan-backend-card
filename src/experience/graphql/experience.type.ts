import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Experience', { description: 'One position in the work history.' })
export class ExperienceType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  company: string;

  @Field(() => String)
  position: string;

  @Field(() => String, { description: 'Start of the period in YYYY-MM format.' })
  periodStart: string;

  @Field(() => String, {
    nullable: true,
    description: 'End of the period in YYYY-MM format, null while the position is current.',
  })
  periodEnd: string | null;

  // achievements is served by @ResolveField through a DataLoader.
}
