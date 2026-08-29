import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { AppConfiguration } from '../config/configuration';
import { resolveRuntimeDatabaseUrl } from './database-file';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const database = configService.get<AppConfiguration['database']>('database', {
      infer: true,
    })!;

    super({
      datasourceUrl: resolveRuntimeDatabaseUrl(database),
      log: database.logQueries ? ['query'] : [],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected');
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
