import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

import { AppModule } from '../dist/app.module';

/**
 * Vercel entry point. The Express instance and the initialised Nest
 * application are module level, so a warm lambda reuses them instead of
 * bootstrapping Nest on every request.
 */
const server = express();
let bootstrapped: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.enableCors();
  await app.init();
}

export default async function handler(request: Request, response: Response): Promise<void> {
  bootstrapped ??= bootstrap();
  await bootstrapped;
  server(request, response);
}
