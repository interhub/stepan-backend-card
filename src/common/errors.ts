/** The client never sees a raw database error, only this short safe message. */
export const DATABASE_QUERY_FAILED_MESSAGE = 'Database query failed';

/**
 * TypeScript always types a caught value as `unknown` and offers no way to
 * annotate it, so the narrowing lives here once instead of in every catch block.
 */
export const describeErrorStack = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
};
