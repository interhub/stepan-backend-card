# Project Structure And Reuse

Applies to all TypeScript code in this repository: `src/**/*.ts` and `api/**/*.ts`.

## Scope

- Answers two questions before a single line is written: where does this file go, and what already exists that does the same thing.
- Conventions themselves live in the sibling rules: `rules/ts-code-style.md` for style and naming, `rules/services-and-data-access.md` for layers, data access and logging.
- Imports are relative between neighbouring modules (`../prisma/prisma.service`). There is no path alias in `tsconfig.json`, so do not invent `@/`.

## The Folder Map

| Folder | What lives there | File naming |
|---|---|---|
| `src/<domain>` | One folder per domain: `profile`, `experience`, `skill`, `project`, `link`. Inside it the module, resolver, service, repository, loader | `<domain>.<role>.ts` |
| `src/<domain>/graphql` | GraphQL object types of that domain only | `<domain>.type.ts` |
| `src/common` | Pure helpers with no dependency on NestJS and no dependency on a domain | `kebab-case.ts` |
| `src/config` | Configuration loading and environment validation | `configuration.ts`, `env.validation.ts` |
| `src/prisma` | The Prisma client and everything around the database file | `prisma.service.ts` |
| `src/database` | Seeding and its types | `seed.ts` |
| `api` | The serverless entry point for Vercel. Only wiring, zero business logic | `index.ts` |
| `prisma` | `schema.prisma` and the database file. The single source of truth for the data model | fixed names |

## The Five Roles Inside A Domain

Every domain folder repeats one and the same set. Do not invent a sixth role.

| Role | Responsibility | Forbidden inside |
|---|---|---|
| `<domain>.module.ts` | Wiring: which providers exist and what is exported | Any logic |
| `<domain>.resolver.ts` | The GraphQL boundary: takes arguments, calls the service or the loader, returns the type | Prisma calls, business rules |
| `<domain>.service.ts` | Business rules and conversion of a row into a GraphQL type | Direct `this.prisma.*` calls |
| `<domain>.repository.ts` | The only place with `this.prisma.*` for this domain | Business rules, GraphQL types |
| `<domain>.loader.ts` | DataLoader batching, request scoped | Its own queries past the service |

## Where A New File Goes

- **A helper used by one domain** stays in that domain's folder. **Used by two or more** it moves to `src/common/`. Move it on the second consumer, not in anticipation of one.
- **Any database query** goes into `<domain>.repository.ts`, even when only one resolver reads it. A query never lives in a service or a resolver.
- **Business logic without a database** goes into `<domain>.service.ts`, or into a pure function in `src/common/` when it has no dependency on Nest.
- **A new domain** gets its own folder with the full set of roles plus its own module registered in `app.module.ts`. Do not add fields of domain B into the service of domain A.
- **A GraphQL type** lives only in `<domain>/graphql/`. A type shared by two domains stays in the folder of the domain that owns the entity, the other one imports it.
- **A new environment variable** is added in one move to `.env.example`, `src/config/env.validation.ts` and `src/config/configuration.ts`. A variable read through a bare `process.env` past `src/config` is a defect.
- **A change to the data model** starts in `prisma/schema.prisma`, then a migration, then the code. Never the other way round.

## When To Create A Subfolder

- Split a folder once it passes roughly 10 loose files. Below that flat is easier to scan.
- Split by domain, not by file kind. Do not create `types/`, `helpers/`, `utils/` buckets inside a domain folder.
- A subfolder name is a noun in `kebab-case` for the thing it owns.

## Naming By File Kind

| Kind | Pattern | Example |
|---|---|---|
| Module | `<domain>.module.ts` | `skill/skill.module.ts` |
| Resolver | `<domain>.resolver.ts` | `profile/profile.resolver.ts` |
| Service | `<domain>.service.ts` | `skill/skill.service.ts` |
| Repository | `<domain>.repository.ts` | `skill/skill.repository.ts` |
| DataLoader | `<domain>.loader.ts` | `skill/skill.loader.ts` |
| GraphQL type | `<domain>.type.ts` | `skill/graphql/skill.type.ts` |
| Shared helper | `kebab-case.ts` | `common/group-by.ts` |

## Barrels

- Do NOT add `index.ts` barrel files. Every import points at the real file.
- A barrel drags unrelated modules into one import graph and invites circular dependencies, which NestJS punishes with an undefined provider at runtime.

## Check Before You Write

A helper is easy to duplicate by accident: the name differs, the body is the same. Search by what the code does, not by the name you have in mind.

```
ls src/*/                                              # the full list of domains and roles
grep -rn "export const" src/common                     # every shared helper that already exists
grep -rn "this.prisma\." src                           # every database query and where it lives
grep -rn "process.env" src api                         # env reads outside src/config are a defect
grep -rn "<FieldName>" prisma/schema.prisma            # does this field already exist in the model
grep -rn "@ObjectType\|@Field" src/*/graphql           # the real GraphQL surface
grep -rl "<SymbolName>" src | wc -l                    # 1 means it is dead code
```

Registries to read before inventing a value:

| Registry | Owns |
|---|---|
| `prisma/schema.prisma` | Every entity, field and relation |
| `src/config/env.validation.ts` | Every environment variable and its validation |
| `src/config/configuration.ts` | Every configuration value the code reads |
| `src/app.module.ts` | Every registered module |
| `src/common/` | Every shared pure helper |

## Reuse Catalogue

| Path | What it gives you |
|---|---|
| `src/common/group-by.ts` | `groupByKey` collects rows into buckets in the exact order of the requested keys, the DataLoader contract |
| `src/common/labels.ts` | `splitLabels` / `joinLabels`, the single format for a list packed into one string field |
| `src/common/paths.ts` | `resolveProjectRoot`, `resolvePrismaDir`, `resolveSeedDataFile`. Every path comes from here, never glued by string concatenation |
| `src/common/errors.ts` | `describeErrorStack` narrows a caught value once, `DATABASE_QUERY_FAILED_MESSAGE` is the safe text the client sees |
| `src/prisma/prisma.service.ts` | The single Prisma client. Never create a second `PrismaClient` |
| `src/prisma/database-file.ts` | Locating and preparing the database file |
| `src/config/configuration.ts` | Every configuration value, read through it and not through `process.env` |

## Reuse Rules

- Before a new helper, look through `src/common/`. A near-identical function with a different name is a duplicate.
- Before a new query, look through the domain's repository. Two queries differing only by an `orderBy` become one query with a parameter.
- Before a new module, check whether the entity belongs to an existing domain. A new domain is justified by its own table in `schema.prisma`, not by a new screen on the client.
- A copied block of code longer than 5 lines is extracted into a shared function on the spot, and not left as a second copy.
