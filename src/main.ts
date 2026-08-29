import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { DEFAULT_GRAPHQL_PATH, DEFAULT_PORT } from './config/configuration';
import { PrismaService } from './prisma/prisma.service';

const BOOTSTRAP_LOGGER_CONTEXT = 'Bootstrap';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();
  app.enableShutdownHooks();
  app.get(PrismaService).enableShutdownHooks(app);
  const port = configService.get<number>('port', DEFAULT_PORT);
  const graphqlPath = configService.get<string>('graphqlPath', DEFAULT_GRAPHQL_PATH);
  await app.listen(port);
  new Logger(BOOTSTRAP_LOGGER_CONTEXT).log(
    `GraphQL and Apollo Sandbox are ready on http://localhost:${port}${graphqlPath}`,
  );
};

void bootstrap();
