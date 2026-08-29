import 'reflect-metadata';

import { LogLevel, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

const LAMBDA_LOG_LEVELS: LogLevel[] = ['error', 'warn'];

/**
 * The lambda runs the compiled application, and `dist` exists only after a
 * build. A static import would therefore make `npm run typecheck` fail on a
 * freshly cloned repository, so the built module is loaded through `require`
 * and given its type here. The path stays a literal, which is what the Vercel
 * file tracer follows when it bundles the function.
 */
const { AppModule } = require('../dist/app.module') as { AppModule: Type };

/**
 * Vercel entry point. The Express instance and the initialised Nest
 * application are module level, so a warm lambda reuses them instead of
 * bootstrapping Nest on every request.
 */
const server = express();
let bootstrapped: Promise<void> | null = null;

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: LAMBDA_LOG_LEVELS,
    // Without this Nest calls process.abort() on a failed bootstrap, which the
    // lambda reports as an opaque FUNCTION_INVOCATION_FAILED with no stack.
    abortOnError: false,
  });
  app.enableCors();
  await app.init();
};

// Vercel loads a serverless function through its default export, so this one
// file keeps the default export the rest of the codebase forbids.
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
