# TypeScript Code Style

Applies to all TypeScript code in this repository: `src/**/*.ts` and `api/**/*.ts`.

## Anti-Patterns (read this first)

Every line below is checkable on a single file. A violation is a defect, not a matter of taste.

- No `default export`. Every file exports through `export const` / `export class` / `export function`.
- No `any` and no `unknown` in your own code. If a value comes from outside, describe its type explicitly.
- No `let` with reassignment. Use `const`; build a new value instead of mutating an old one.
- No static class methods. A class exists only when NestJS needs it as a provider (service, repository, resolver, module, loader). Everything else is a plain exported function.
- No mutation of input parameters. A function does not change the object it received.
- No ternary operators inside expressions with logic. Write a function with `if` and early `return`.
- No dynamic imports built from a string (`import('./' + name)`). Only static imports.
- No short variable names: `i`, `j`, `ev`, `cur`, `item`, `res`, `tmp`. A name says what lies inside: `profileId`, `skillRows`, `currentSortOrder`.
- No wrapper functions created only to add logging. Logging goes inside the existing function.
- No silently swallowed errors. `catch` either handles the error or logs it and returns an explicit result.
- No suppressed TypeScript errors: `@ts-ignore`, `@ts-expect-error` and a cast to `any` are forbidden, fix the type.
- No magic numbers and strings inside logic. Take them out into a `const` in UPPER_SNAKE_CASE next to the usage or into a shared constants file.

## Size Limits

- A function is at most 30 lines of body. Longer means split it into named parts.
- A file is at most 200 lines. Longer means split it by responsibility.
- Nesting is at most 3 levels of `if` / `for` / `try`. Deeper means take the inner block into a separate function.
- A function takes at most 3 positional parameters. From the fourth onward pass a single named object.
- One exported entity per file: one class, or one function, or one closely related group of small pure helpers on one subject.

## Code Style

- Small focused functions, early return instead of deep nesting.
- `for...of` instead of `for (let index = 0; ...)`.
- Use built-in array methods (`map`, `filter`, `reduce`, `find`) instead of hand-written loops where they read shorter.
- No empty lines between consecutive statements inside a function. An empty line only separates meaningful blocks.
- Formatting comes from `.prettierrc`: single quotes, trailing commas, line width 100. Never format by hand against it.
- Comments in English only, and only on a non-obvious place: a workaround, a limitation of an external system, a non-obvious contract. A comment retelling the code is deleted.
- Follow DRY, KISS, YAGNI. No abstraction until there is a second real usage.
- The diff stays local. Do not refactor what the task did not ask for.

## Naming

- Classes, types, interfaces, enums: `PascalCase` (`SkillRepository`, `ProfileType`).
- Functions, methods, variables: `camelCase` (`findManyByProfileIds`, `isPublished`).
- Constants and enum members: `UPPER_SNAKE_CASE` (`DEFAULT_PAGE_SIZE`, `DATABASE_FILE_NAME`).
- File names: `kebab-case` with a role suffix, as NestJS does it: `skill.service.ts`, `skill.repository.ts`, `profile.resolver.ts`, `group-by.ts`.
- Folder names: `kebab-case`, a noun for the domain it owns: `profile/`, `experience/`, `common/`.
- Boolean names start with `is`, `has`, `should`, `can`.
- A function name starts with a verb: `findManyByProfileIds`, `buildDatabasePath`, `groupByKey`.
- Full words instead of abbreviations. `configuration` not `cfg`, `repository` not `repo` in a public name.

## Types

- Every exported function has an explicit return type. Inference is allowed only for local variables.
- Prisma model types are imported from `@prisma/client`, never redeclared by hand.
- A GraphQL type and a database row are two different types. Conversion between them happens in one explicit mapper function.
- A closed set of values is an `enum` or a union of string literals, never a bare `string`.
- No optional field "just in case". A field is optional only when it is genuinely absent in part of the cases.

## Error Handling

- An error is handled explicitly. There is no `catch {}` and no `catch` that only does `console.log`.
- Preferred contract for internal operations: return `{success: boolean, payload}` instead of throwing.
- Throwing is allowed at the framework boundary: a resolver throws a NestJS HTTP or GraphQL error so the client gets a correct code.
- A raw database or external service error never reaches the client. It is logged, and the client receives a short safe message.
- `try/catch` wraps every asynchronous call to an external system: the database, an HTTP client, the file system.
- Input data is validated at the entry boundary: resolver arguments and environment variables. Deeper layers trust already validated data.
- Secrets never end up in a log or an error message: passwords, tokens, API keys, connection strings.

## Example

```typescript
// Good - named export, explicit types, early return, no ternary
const MAX_SKILL_LEVEL = 5;

export const normalizeSkillLevel = (level: number): number => {
  if (level < 0) {
    return 0;
  }
  if (level > MAX_SKILL_LEVEL) {
    return MAX_SKILL_LEVEL;
  }
  return level;
};

// Bad - default export, any, magic number, ternary with logic
export default function n(l: any) {
  return l > 5 ? 5 : l < 0 ? 0 : l;
}
```
