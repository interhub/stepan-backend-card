# Services, Data Access And Logging

Applies to all TypeScript code in this repository: `src/**/*.ts` and `api/**/*.ts`.

## Layer Contracts

- Logic never sits in a resolver. A resolver takes arguments, calls one service or one loader, and returns the result. A resolver method is at most 10 lines.
- A service holds business rules and the conversion of a database row into a GraphQL type. A service never calls `this.prisma` directly.
- A repository is the only place with `this.prisma.*` for its domain. It returns Prisma model rows and knows nothing about GraphQL.
- One service does one thing. If its name needs the word "and", split it in two.
- A cross-domain call goes service to service, never repository to a foreign repository.
- Everything a class needs comes through the constructor as `private readonly`. No manual `new` of a provider and no global singleton beside the Nest container.

## Extracting Logic

- Business logic lives in a service or in a pure function in `src/common/`, not inside a resolver and not inside a `@Field` decorator.
- Pure logic with no dependency on NestJS and no dependency on Prisma goes into `src/common/` as an exported function. Such a function is testable without starting the application.
- A row to GraphQL type mapper is a separate named function, `toGraphqlSkill(row)` style, not a static class method and not an inline object inside a `map`.
- A repeated block of 5 lines or more turns into a named function on the spot.

## Prisma And Queries

- One Prisma client for the whole application, `PrismaService`. Never a second `new PrismaClient()`.
- Every query lists the fields it needs through `select`. `include` of a whole relation is only for a case where all its fields are genuinely used.
- Every list query has an explicit `orderBy`. Without it the row order is undefined and the answer becomes unstable between calls.
- A query inside a loop is forbidden. A batch of ids is fetched by a single query with `where: {id: {in: ids}}` and spread out by `groupByKey` from `src/common/group-by.ts`.
- A nested GraphQL field over a list goes through a request scoped DataLoader in `<domain>.loader.ts`. A direct service call from a nested resolver brings the N+1 problem back.
- A DataLoader returns exactly as many buckets as there were keys, in the same order. That is the contract of `groupByKey` and it must not be broken.
- A list query that can return more than 100 rows takes `take` and `skip`. There is no unbounded list.
- The data model changes only through `prisma/schema.prisma` plus a migration. No raw SQL for a change the schema can express.
- `$queryRaw` is allowed only where Prisma genuinely cannot express the query, and only with parameters, never with string concatenation of user input.

## Asynchronous Code

- Every function returning a `Promise` is declared with an explicit `Promise<T>` return type.
- No forgotten `await`. A promise started without `await` and without a deliberate handler is a defect.
- Independent asynchronous calls run through `Promise.all`, not one after another in a sequence of `await`s.
- Every external call has a timeout or a cancellation. A hanging request must not hold the process forever.
- Resources are released explicitly: NestJS lifecycle hooks `onModuleInit` and `onModuleDestroy`, and nothing outside them.

## Errors At The Boundary

- A raw Prisma or external service error never reaches the client. It is logged, and the client receives a short safe message.
- A resolver throws a NestJS error with a correct code, `NotFoundException` for an absent entity, `BadRequestException` for bad input.
- An empty result is not an error. An absent list comes back as `[]`, an absent entity as `null`, and only an explicitly required entity throws.
- Input is validated at the entry boundary: resolver arguments and environment variables in `src/config/env.validation.ts`. Deeper layers trust already validated data.

## Logging

- Logging goes through the NestJS `Logger` with the class name as the context: `private readonly logger = new Logger(SkillService.name)`. No bare `console.log` in `src/`.
- `logger.log` for a meaningful lifecycle event, `logger.warn` for a recoverable deviation, `logger.error` for a failure with the error object passed in.
- A log line carries structured context: the operation name and the ids involved. Not `logger.log('error')` but `logger.error('findManyByProfileIds failed', error.stack)`.
- Never create a function whose only job is to log. Logging is added inside the existing function.
- Never log a whole object. List the few flat fields you need: an id, a count, a duration, a status.
- Never log secrets: tokens, passwords, API keys, the connection string, any part of `process.env`.
- Log a failure once, at the place that handles it. The same error logged in the repository, the service and the resolver produces three lines about one event.
- Do not log inside a loop over rows. Log the aggregate: how many rows, how long it took.

## Naming Of Operations

- A repository method says what it returns and by what: `findManyByProfileIds`, `findBySlug`, `countByProfileId`.
- `findOne...` may return `null`. `getOne...` guarantees an entity and throws when it is missing. Keep the two prefixes apart.
- `findMany...` always returns an array, an empty one when nothing was found.
- A mutation method starts with `create`, `update`, `delete`.

## Example

```typescript
// Good - repository owns the query, service owns the rules, mapper is a plain function
@Injectable()
export class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfileIds(profileIds: readonly string[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }
}

export const toGraphqlSkill = (row: Skill): SkillType => ({
  id: row.id,
  name: row.name,
  category: row.category,
  level: row.level,
});

// Bad - a query per key, no orderBy, Prisma inside a service
async findByProfileIds(profileIds: string[]) {
  const result = [];
  for (const id of profileIds) {
    result.push(await this.prisma.skill.findMany({ where: { profileId: id } }));
  }
  return result;
}
```
