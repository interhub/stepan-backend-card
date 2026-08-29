import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

import { describeErrorStack } from '../common/errors';
import { DatabaseConfiguration } from '../config/configuration';
import { resolveRuntimeDatabaseUrl } from './database-file';

const QUERY_LOG_LEVELS: Prisma.LogLevel[] = ['query'];

const readDatabaseConfiguration = (configService: ConfigService): DatabaseConfiguration => {
  const database = configService.get<DatabaseConfiguration>('database');
  if (!database) {
    throw new Error('Database configuration is missing from src/config/configuration.ts');
  }
  return database;
};

const resolveLogLevels = (logQueries: boolean): Prisma.LogLevel[] => {
  if (logQueries) {
    return QUERY_LOG_LEVELS;
  }
  return [];
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const database = readDatabaseConfiguration(configService);
    super({
      datasourceUrl: resolveRuntimeDatabaseUrl(database),
      log: resolveLogLevels(database.logQueries),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (error) {
      this.logger.error('onModuleInit failed to connect Prisma', describeErrorStack(error));
      throw error;
    }
  }

  /**
   * Nest closes the app on SIGTERM/SIGINT; this makes sure the pending Prisma
   * queries are flushed before the process is gone.
   */
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
