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
    // Without this Nest calls process.abort() on a failed bootstrap, which the
    // lambda reports as an opaque FUNCTION_INVOCATION_FAILED with no stack.
    abortOnError: false,
  });
  app.enableCors();
  await app.init();
}

export default async function handler(request: Request, response: Response): Promise<void> {
  // A failed cold start must not be cached, otherwise the lambda stays broken
  // until it is recycled.
  try {
    bootstrapped ??= bootstrap();
    await bootstrapped;
  } catch (error) {
    bootstrapped = null;
    throw error;
  }
  server(request, response);
}
