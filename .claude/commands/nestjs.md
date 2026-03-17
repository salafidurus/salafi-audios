# NestJS Development Guide

Use context7 to query NestJS documentation: `/nestjs/docs.nestjs.com`

## Architecture (This Project)

Backend follows strict layering in `apps/api/src/`:

```
Interface     → controllers, DTOs, guards (validation, auth)
Application   → use-case orchestration, transactions
Domain        → invariants, business rules, state transitions
Infrastructure → DB, media, external adapters (no policy)
```

## Module Structure

Each feature module should follow:

```
modules/<feature>/
├── <feature>.module.ts      # NestJS module definition
├── <feature>.controller.ts  # HTTP interface
├── <feature>.service.ts     # Application/domain logic
├── <feature>.repository.ts  # Data access (optional)
├── dto/                     # Request/response DTOs
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
└── entities/                # Domain entities (if not using Prisma)
```

## Common Patterns

### Controllers

```typescript
@Controller("features")
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  findAll(): Promise<Feature[]> {
    return this.featuresService.findAll();
  }

  @Post()
  create(@Body() dto: CreateFeatureDto): Promise<Feature> {
    return this.featuresService.create(dto);
  }
}
```

### DTOs with Validation

```typescript
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Services

```typescript
@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Feature[]> {
    return this.prisma.feature.findMany();
  }
}
```

## Guards and Authorization

Authorization is BACKEND-ONLY. Use guards:

```typescript
@UseGuards(AuthGuard)
@Controller("admin")
export class AdminController {}
```

## Testing

```bash
# Run all API tests
pnpm --filter api test

# Run specific test file
pnpm --filter api test -- src/modules/topics/topics.service.spec.ts

# Run by test name
pnpm --filter api test -- -t "should create topic"

# Watch mode
pnpm --filter api test:watch
```

## Documentation Lookup

When you need NestJS docs, use context7:

```
Query context7 with library ID: /nestjs/docs.nestjs.com
```

Topics: modules, providers, controllers, middleware, guards, interceptors, pipes, exception filters, custom decorators, OpenAPI/Swagger, testing, microservices, WebSockets, GraphQL, authentication, authorization, database, caching, serialization, task scheduling, queues, events, logging, cookies, sessions, file upload, streaming, SSE, CLI, recipes
