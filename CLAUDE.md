# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Backend server for an online-course ("趣学网") video platform, built with NestJS 10, TypeScript, TypeORM (MySQL), and Redis. It exposes a REST API (with Swagger docs) for two realms: backend admin/teacher accounts and frontend student users. Videos are uploaded in chunks, transcoded to multiple H.264 resolutions, and encrypted to HLS/AES-128 m3u8 via ffmpeg.

Package manager is **pnpm**. The codebase's comments and all user-facing messages are written in Chinese.

## Commands

```bash
pnpm install          # install dependencies

pnpm run start:dev    # run in watch mode (NODE_ENV=development, CORS enabled)
pnpm run start        # run production build via nest start
pnpm run build        # nest build (outputs to dist/)
pnpm run start:prod   # node dist/main

pnpm run lint         # eslint --fix over src/apps/libs/test
pnpm run format       # prettier --write src/**/*.ts

pnpm run test         # jest (unit tests)
pnpm run test:watch   # jest --watch
pnpm run test:cov     # jest --coverage
pnpm run test:e2e     # e2e via test/jest-e2e.json

pnpm run commit       # commitizen (cz-conventional-changelog-zh)
```

- Jest config lives in `package.json` (not a separate file): `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"`. Run a single test with `pnpm run test -- path/to/file.spec.ts`.
- Git commits are gated by Husky + lint-staged (runs `format` + `lint` on staged files) and commitlint (conventional-commits). Use `pnpm run commit` to get the interactive Chinese conventional-commit prompt.

## Environment & configuration

- Config comes from `.env` at the repo root, loaded by `@nestjs/config` (`ConfigModule.forRoot` in `src/app.module.ts`). `.env.development` / `.env.production` are selected by `NODE_ENV`.
- **Secrets are not stored in `.env` directly.** Many `.env` values are filesystem *paths* to files containing the actual secret (DB username/password, email auth code, OAuth keys, video encryption key). Read them with `readFileData(path, utf8)` from `@src/utils/tools`.
- `.env` contains absolute Windows paths (this is developed on Windows), e.g. `UPLOAD_PATH`, `VIDEO_PATH`, `DATABASE_USER_PATH`.
- Ambient type declarations in `src/types/package/node.d.ts` describe the full `NodeJS.ProcessEnv` surface; `src/types/package/express.d.ts` extends `Express.Request` with `account_token` / `user_token`.
- TypeORM uses `synchronize: true` **only** when `NODE_ENV === "development"` (see `src/config/database/index.ts`). There are no migrations; schema is generated from entities and seed data is created at runtime (see "Initialization" below).
- Global API prefix is `/api`; Swagger UI is at `/docs`, JSON at `/docs-json` (set up in `src/main.ts`).

## Architecture

### Directory map

- `src/main.ts` — bootstrap: global `ValidationPipe`, `/api` prefix, global filters/interceptor, Swagger setup.
- `src/app.module.ts` — root module importing all feature modules.
- `src/module/<domain>/` — feature modules, each with `controller/`, `service/`, `entity/`, `dto/`, and optional nested `module/<submodule>/`. `index.ts` barrel files re-export each layer.
- `src/common/` — cross-cutting Nest plumbing: `decorator/`, `guard/`, `filter/`, `interceptor/`, `pipe/`.
- `src/config/` — config factories and constants: `database/`, `message/`, `oauth/`, `upload/`.
- `src/lib/` — framework-agnostic domain helpers: `folder/` (filesystem abstraction), `oauth/` (Alipay/Gitee/Github SDK wrappers), `video-processing/` (ffmpeg transcode + m3u8 encryption).
- `src/utils/` — pure helpers: `crypto/`, `events/`, `ffmpeg/`, `tools/`.
- `src/types/` — shared types: `common/` (token payloads, event names), `docs/` (Swagger response DTOs), `package/` (ambient declarations).

The path alias `@src/*` maps to `src/*` (defined in `tsconfig.json` `paths`). A few files still import via bare `src/...`; both resolve.

### Request lifecycle & response envelope

Every successful response is normalized by `ResponseInterceptor` (`src/common/interceptor/response.interceptor.ts`) into:

```json
{ "code": 200, "msg": "ok", "data": <result> }
```

Errors flow through two global filters registered in `main.ts`:
- `HttpExceptionFilter` — catches `HttpException` (validation errors, `BadRequestException`, etc.) and returns `{ code: <status>, msg, timestamp, path, method }`.
- `InternalErrorFilter` — catches everything else, logs a JSON line to `ERROR_LOG_PATH`, emails the error (via nodemailer), and returns a 500 envelope.

The Swagger custom decorators `@ApiResponse(Model)`, `@ApiResponsePage(Model)`, `@ApiResponseEmpty()` (in `src/common/decorator/`) document this envelope. `@ApiResponsePage` documents the pagination shape `{ list, total, has_more }` produced by `pageResult()` in `@src/utils/tools`. Pagination is done with `offset`/`limit`/`desc` query params (validated by `OffsetPipe`, `LimitPipe`, `BooleanPipe`).

### Authentication & authorization (two realms)

There are two independent JWT realms, distinguished by secret and guard:

- **Backend accounts** (admin/teacher): `AccountGuard` verifies the token and stores the payload on `request.account_token`. `@Role(Roles.X)` + `RoleGuard` enforce role-based access. `@AccountToken("sub" | "role_name")` extracts fields. Roles are `SuperAdmin`, `Admin`, `Teacher` (`src/module/account/module/role/enum/index.ts`).
- **Frontend users**: `UserGuard` (required) or `UserOptionalGuard` (allows anonymous). Payload stored on `request.user_token`; `@UserToken("sub")` / `@UserOptionToken("sub")` extract it.

Guards construct `JwtService` directly (they are not registered as providers) and read secrets from `JSON_WEB_TOKEN_ACCOUNT_SECRET` / `JSON_WEB_TOKEN_USER_SECRET`. Controllers combine guards and decorators, e.g.:

```ts
@Role(Roles.TEACHER)
@UseGuards(AccountGuard, RoleGuard)
@Post()
publishVideo(@AccountToken("sub") accountId: number, @Body() dto: PublishVideoDto) { ... }
```

### Dependency injection & providers

- TypeORM repositories: `@InjectRepository(Entity)` with `TypeOrmModule.forFeature([...])` in the module.
- Other services: `@Inject(ServiceClass)`.
- Config/IO objects are exposed as **string-token providers** defined in `*.provider.ts` files, e.g. `"REDIS_CLIENT"`, `"EMAIL_TRANSPORT"`, `"UPLOAD_CONFIG"`, `"AUTO_VIDEO_COVER"`, `"UPLOAD_VIDEO"`, `"UPLOAD_VIDEO_TEMP"`, `"VIDEO_PROCESSING"`, and the OAuth clients (`"GITHUB_OAUTH"`, `"GITEE_OAUTH"`, `"ALIPAY_OAUTH"`). These are constructed via `useFactory` reading `ConfigService`. Injected via `@Inject("TOKEN")`.
- Circular module/service dependencies are broken with `forwardRef(() => ...)` (e.g. `VideoModule` ↔ `VideoCollectionModule`/`VideoFavoriteModule`).

### Entities & database

- Every entity must be registered in the `entities` array in `src/config/database/index.ts` — there is no auto-discovery. The `TypeOrmConfigService` is wired in `app.module.ts` via `TypeOrmModule.forRootAsync`.
- Entities use explicit column comments, `@CreateDateColumn` / `@UpdateDateColumn` / `@DeleteDateColumn`, and `softDelete`/`softRemove` for logical deletes. IDs use snake_case names like `video_id`, `account_id`.
- Relation conventions: `@ManyToOne` + `@JoinColumn({ name: "xxx_id" })`, and join tables/relation entities for many-to-many (e.g. `VideoRelationTag`, `VideoRelationFavorite`).

### Initialization & seed data (no migrations)

Runtime seeding is done by `initLoader(...)` functions, called from module/service/controller constructors (not lifecycle hooks):

- `RoleService`/`role.controller` — creates the three roles, then emits `ROLE_DATA_INIT_DONE` via the global event emitter (`src/utils/events`).
- `AccountService`/`account.controller` — listens `once("ROLE_DATA_INIT_DONE")` and creates the super admin from `SUPER_ADMIN_*` env vars.
- `AuthUserService`/`auth-user.controller` — creates the register-type rows (github/alipay/gitee/email).
- `UploadService` constructor — creates the upload folder tree (paths from `UploadConfig`).

### Video upload & processing pipeline

1. Chunked upload via `ChunkFolder` (`src/lib/folder/chunk.ts`) keyed by file hash; chunks are merged back into the upload-video folder.
2. `UploadVideoService` (`src/module/upload/module/video/upload-video.service.ts`) tracks progress in Redis (`video-merge:<hash>`, `video-processing:<file_id>`), supports "秒传"/fast-upload via hash lookup.
3. `VideoProcessing` (`src/lib/video-processing/index.ts`) transcodes the source to multiple H.264 resolutions (360/480/720/1080 + "raw"), then `generateM3U8Video` (in `src/utils/ffmpeg`) encrypts each into HLS/AES-128 m3u8 segments, storing a `FileVideo` row per resolution.
4. `fluent-ffmpeg` must be imported via CommonJS `require` (see the eslint-disable comment in `src/utils/ffmpeg/index.ts`).

## Conventions

- Imports are sorted by `simple-import-sort` (enforced as eslint error); the barrel `index.ts` files re-export each module's layers.
- All user-facing strings (Chinese) are centralized as `Object.freeze` constants in `src/config/message/index.ts`, grouped per module. Throw Nest HTTP exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`, etc.) with these messages rather than returning error codes.
- `bodyOptionCatcher(o, keys)` (`@src/utils/tools`) is used on PATCH/PUT endpoints whose DTO fields are all optional, to reject empty bodies.
- Prettier: `singleQuote: false`, `trailingComma: "all"`, `semi: true`.
- Comments, JSDoc, and Swagger descriptions are written in Chinese.
