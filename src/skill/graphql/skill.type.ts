import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Skill', {
  description: 'A single technology or leadership skill of the profile owner.',
})
export class SkillType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { description: 'Grouping label, for example "AI" or "DevOps".' })
  category: string;

  @Field(() => String, {
    description: 'Self-assessed proficiency: Expert, Advanced, Intermediate.',
  })
  level: string;
}
