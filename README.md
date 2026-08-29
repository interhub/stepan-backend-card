# Digital Business Card API

A GraphQL backend that serves one professional profile and everything attached to it:
skills, work experience, projects and links.

**Stack:** TypeScript, Node.js, NestJS, Prisma, GraphQL (Apollo, code-first), SQLite, Docker.

**Live Apollo Sandbox:** https://stepan-backend-card.vercel.app

---

## Run locally

```bash
npm install
cp .env.example .env   # only the Prisma CLI reads it, the application has defaults
npm run db:prepare     # generate client, create the SQLite file, build, seed
npm start              # http://localhost:3000
```

`db:prepare` is idempotent, so it is safe to run it again at any time.
Open `http://localhost:3000` in a browser to get Apollo Sandbox, or query the same URL with curl.

## Run with Docker

```bash
docker compose up --build   # http://localhost:3000
```

The container entrypoint applies the Prisma schema and seeds the database before the API starts,
so a fresh container is always ready without any manual step.

## Example query

```graphql
query {
  profile {
    name
    description
    skills { name }
    experience { company position achievements }
    projects { name role periodStart periodEnd results tags }
    links { label url }
  }
}
```

```bash
curl -s http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { profile { name description skills { name } experience { company position } projects { name } } }"}'
```

---

## Architecture

```
GraphQL request
      |
  Resolver      transport only: arguments in, DTOs out, no database access
      |
  Service       business logic, Prisma rows mapped to GraphQL object types
      |
 Repository     the only layer that touches PrismaService
      |
  PrismaService global module, connects on module init, closes on shutdown
```

One folder per entity. Every one of them has a module, a repository and a service; a resolver
is added where the entity answers a query or a nested field, and a request scoped DataLoader
where it is loaded as a relation of another type:

```
src/
  config/         @nestjs/config module, typed configuration, env validation
  prisma/         global PrismaModule, PrismaService, serverless database file handling
  database/       idempotent seeding from data/profile-seed.json
  common/         DataLoader grouping helper, path helpers
  profile/        resolver (queries + @ResolveField for every relation), service, repository
  skill/          repository, service, loader
  experience/     repository, service, loader, resolver for the achievements relation
  project/        repository, service, loader, resolver for the results relation
  link/           repository, service, loader
api/index.ts      Vercel handler, caches the initialised Nest application between invocations
```

Relations are never resolved with one fat `include`. Each nested field is a `@ResolveField`
backed by a per-request DataLoader, so the query above costs exactly seven SQL statements
(one per entity type) no matter how many rows come back. Set `PRISMA_LOG_QUERIES=true` to see them.

Apollo Sandbox is mounted at the root path in every environment through
`ApolloServerPluginLandingPageLocalDefault({ includeCookies: true, embed: true })`,
with the legacy playground turned off, so the deployed production URL is explorable too.

## Database

SQLite was chosen because the card is a small read-only dataset and a single file needs no
external service, which is what makes the one-command Docker run and the Vercel deployment possible.

Achievements of a position and results of a project live in their own `achievements` and
`project_results` tables rather than in a JSON column, because that keeps them ordered,
deduplicated by a natural key for idempotent seeding, and gives the N+1 problem real nested
relations to solve.

Short display labels (`languages`, project `tags`) are stored as a delimited string: SQLite has no
array type and those values are never filtered on.

## Deploying to Vercel

A lambda cannot run the Prisma CLI and cannot write anywhere except `/tmp`, so:

1. `npm run db:prepare` builds and seeds `prisma/card.db`, and that file is committed to git.
2. On a cold start the app copies `prisma/card.db` to `/tmp/card.db` and Prisma opens the copy.
3. `binaryTargets = ["native", "linux-arm64-openssl-3.0.x", "rhel-openssl-3.0.x"]` ships the query
   engine for the local machine and for both CPU architectures of the Vercel runtime.
4. `vercel.json` rewrites every path to `api/index` and bundles `dist`, `prisma`, `data` and the
   Prisma client.

Because the database lives in `/tmp`, writes are per-instance and disappear with the instance.
That is fine here: the card is read-only.

## Configuration

Every variable is optional for the application. A missing value and an empty value both fall
back to the default below, so the API starts on a fresh clone with no `.env` file and no
environment variable set at all. The Prisma CLI is the one exception: `prisma db push` inside
`npm run db:prepare` reads `DATABASE_URL` from `.env`, which is what copying `.env.example` is for.
A value that is present but wrong (`DATABASE_URL` pointing at Postgres, a non numeric `PORT`)
still stops the application with an explicit message.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `file:./card.db` | SQLite file, relative paths resolve against `prisma/` |
| `PORT` | `3000` | HTTP port |
| `GRAPHQL_PATH` | `/` | GraphQL endpoint and Sandbox path |
| `PROFILE_SLUG` | `stepan-turchenko` | Slug used by the seeder |
| `DATABASE_COPY_TO_TMP` | auto on Vercel | Copy the database to `/tmp` on start |
| `DATABASE_TMP_PATH` | `/tmp/card.db` | Where that copy is written |
| `PRISMA_LOG_QUERIES` | `false` | Print every generated SQL statement |
