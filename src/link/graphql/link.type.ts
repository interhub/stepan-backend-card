import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Link', { description: 'External profile link: website, social network, messenger.' })
export class LinkType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  url: string;
}
