import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.enableShutdownHooks();
  app.get(PrismaService).enableShutdownHooks(app);

  const port = configService.get<number>('port', 3000);
  const path = configService.get<string>('graphqlPath', '/');

  await app.listen(port);
  new Logger('Bootstrap').log(`GraphQL and Apollo Sandbox are ready on http://localhost:${port}${path}`);
}

void bootstrap();
