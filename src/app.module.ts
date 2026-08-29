import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { AppConfigModule } from './config/config.module';
import { ExperienceModule } from './experience/experience.module';
import { LinkModule } from './link/link.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectModule } from './project/project.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => ({
        // Code-first: the SDL is generated from the decorated classes and kept
        // in memory, because a serverless file system is read-only.
        autoSchemaFile: true,
        sortSchema: true,
        path: configService.get<string>('graphqlPath', '/'),
        introspection: true,
        // The built-in playground is replaced by Apollo Sandbox, which is
        // served in every environment including production.
        playground: false,
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({ includeCookies: true, embed: true }),
        ],
      }),
    }),
    ProfileModule,
    SkillModule,
    ExperienceModule,
    ProjectModule,
    LinkModule,
  ],
})
export class AppModule {}
