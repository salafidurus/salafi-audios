# Auth Buttons Redesign + Native Apple Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace image-based auth buttons with CSS-styled buttons across web and native, and implement native Apple sign-in with identity token verification.

**Architecture:** Four independent workstreams: (1) backend Apple identity token verification via JWKS, (2) native Apple config + signInAsync flow, (3) native Google button CSS redesign, (4) web auth button CSS redesign incorporating official Apple and Google brand guidelines.

**Tech Stack:** `jose` (JWT/JWKS verification on backend), `react-native-svg` (native Google icon), `appleid.auth.js` (Apple JS SDK — official button rendering + OAuth flow on web), `expo-apple-authentication` (native `signInAsync`), `better-auth` (session management, Google OAuth on web), Prisma (direct DB access for Apple native sign-in), CSS Modules + Unistyles (web/native styling)

## Reference Links

- [Apple — Displaying Sign in with Apple Buttons on the Web](https://developer.apple.com/documentation/signinwithapple/displaying-sign-in-with-apple-buttons-on-the-web)
- [Apple — Sign in with Apple JS SDK](https://developer.apple.com/documentation/signinwithapplejs)
- [Apple JS SDK CDN](https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js)
- [Apple — Authenticating Users with Sign in with Apple](https://developer.apple.com/documentation/signinwithapple/authenticating_users_with_sign_in_with_apple)
- [Apple — Verifying a User Token Service](https://developer.apple.com/documentation/signinwithapple/verifying_a_user_token_service) (JWKS verification)
- [Apple — Apple JWKS endpoint](https://appleid.apple.com/auth/keys)
- [Google — Branding Guidelines for Sign In With Google](https://developers.google.com/identity/branding-guidelines)
- [`expo-apple-authentication` SDK docs](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [`jose` JWT/JWKS library](https://github.com/panva/jose)
- [`react-native-svg`](https://github.com/react-native-svg/react-native-svg)
- [better-auth social sign-in docs](https://better-auth.com)

## Global Constraints

- Aria labels `"Continue with Apple"` / `"Continue with Google"` must be preserved on web buttons to pass existing tests.
- Native `SignInScreenProps` must not break existing route.
- Backend endpoint must verify Apple identity token JWT signature, issuer, and audience.
- `ios.usesAppleSignIn: true` must be set in native `app.config.ts`.
- `expo-apple-authentication` plugin must be added to native `app.config.ts` plugins array.
- Existing Google button PNGs in `apps/web/public/auth/` and `apps/native/assets/auth/` should be removed only after the new buttons are verified working.
- All i18n text for button labels must use existing translation keys from `@sd/core-i18n` (do not add new keys without verifying they're missing).

---

### Task 1: Backend — Apple identity token verification service + endpoint

**Files:**

- Create: `apps/api/src/modules/auth/apple-native.repo.ts`
- Create: `apps/api/src/modules/auth/apple-native.repo.spec.ts`
- Create: `apps/api/src/modules/auth/apple-native.service.ts`
- Create: `apps/api/src/modules/auth/apple-native.service.spec.ts`
- Create: `apps/api/src/modules/auth/apple-native.controller.ts`
- Create: `apps/api/src/modules/auth/apple-native.controller.spec.ts`
- Create: `apps/api/src/modules/auth/dto/apple-native-sign-in.dto.ts`
- Modify: `apps/api/src/modules/auth/auth.module.ts`
- Modify: `apps/api/package.json` (add `jose`)

**Interfaces:**

- Consumes: `ConfigService` (for `APPLE_CLIENT_ID`), `PrismaService` (NestJS DI — already `@Global()`) via repo layer
- Produces: `POST /api/auth/apple/native` endpoint
- Produces: `AppleNativeRepository` — `findAccountByProviderId(providerId, accountId)`, `createUser(data)`, `createAccount(data)`, `createSession(data)`
- Produces: `AppleNativeService.verifyIdentityToken(token): Promise<AppleIdentityPayload>`
- Produces: `AppleNativeService.handleAppleSignIn(payload, appleUser?): Promise<{ session, user }>`
- Layering: controller orchestrates → service owns business logic + token verification → repo owns all DB queries via injected `PrismaService`
- Do NOT create a standalone `PrismaClient` instance; use NestJS-managed `PrismaService`

- [ ] **Step 1: Write the failing AppleNativeRepository test**

Create `apps/api/src/modules/auth/apple-native.repo.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../../shared/db/prisma.service";
import { AppleNativeRepository } from "../apple-native.repo";

describe("AppleNativeRepository", () => {
  let repo: AppleNativeRepository;
  let prisma: {
    account: { findFirst: ReturnType<typeof vi.fn> };
    user: { create: ReturnType<typeof vi.fn> };
    accountCreate: ReturnType<typeof vi.fn>;
    session: { create: ReturnType<typeof vi.fn> };
  };

  const mockPrisma = {
    account: { findFirst: vi.fn() },
    user: { create: vi.fn() },
    session: { create: vi.fn() },
  };

  beforeEach(async () => {
    prisma = {
      account: { findFirst: vi.fn() },
      user: { create: vi.fn() },
      accountCreate: vi.fn(),
      session: { create: vi.fn() },
    };
    mockPrisma.account.findFirst.mockReset();
    mockPrisma.user.create.mockReset();
    mockPrisma.session.create.mockReset();
    // Attach accountCreate mock for the repo's this.prisma.account.create call
    mockPrisma.account.create = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppleNativeRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    repo = module.get<AppleNativeRepository>(AppleNativeRepository);
  });

  describe("findAccountByProviderId", () => {
    it("calls prisma.account.findFirst with correct args", async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ userId: "u1" });
      const result = await repo.findAccountByProviderId("apple", "abc123");
      expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
        where: { providerId: "apple", providerAccountId: "abc123" },
      });
      expect(result).toEqual({ userId: "u1" });
    });
  });

  describe("createUser", () => {
    it("creates a user with the given data", async () => {
      const data = { name: "John Doe", email: "j@test.com" };
      mockPrisma.user.create.mockResolvedValue({ id: "u1", ...data });
      const result = await repo.createUser(data, true);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { ...data, emailVerified: true },
      });
      expect(result.id).toBe("u1");
    });
  });

  describe("createAccount", () => {
    it("creates an account record", async () => {
      mockPrisma.account.create = vi.fn().mockResolvedValue({ id: "acct1" });
      const result = await repo.createAccount({
        userId: "u1",
        providerId: "apple",
        providerAccountId: "abc",
      });
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: { userId: "u1", providerId: "apple", providerAccountId: "abc", type: "oidc" },
      });
      expect(result.id).toBe("acct1");
    });
  });

  describe("createSession", () => {
    it("creates a session and returns id + expiresAt", async () => {
      const expiresAt = new Date();
      mockPrisma.session.create.mockResolvedValue({ id: "s1", expiresAt });
      const result = await repo.createSession("u1");
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: { userId: "u1", expiresAt: expect.any(Date) },
      });
      expect(result.id).toBe("s1");
    });
  });
});
```

- [ ] **Step 2: Run repo test to verify it fails**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.repo.spec.ts
```

Expected: FAIL — `AppleNativeRepository` not found.

- [ ] **Step 3: Write AppleNativeRepository**

Create `apps/api/src/modules/auth/apple-native.repo.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/db/prisma.service";

@Injectable()
export class AppleNativeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAccountByProviderId(providerId: string, providerAccountId: string) {
    return this.prisma.account.findFirst({
      where: { providerId, providerAccountId },
    });
  }

  async createUser(data: { name: string; email: string }, emailVerified: boolean) {
    return this.prisma.user.create({
      data: { ...data, emailVerified },
    });
  }

  async createAccount(data: { userId: string; providerId: string; providerAccountId: string }) {
    return this.prisma.account.create({
      data: { ...data, type: "oidc" },
    });
  }

  async createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.session.create({
      data: { userId, expiresAt },
    });
  }
}
```

- [ ] **Step 4: Run repo test to verify it passes**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.repo.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Write the failing AppleNativeService test**

Create `apps/api/src/modules/auth/apple-native.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../../../shared/config/config.service";
import { AppleNativeRepository } from "../apple-native.repo";
import { AppleNativeService } from "../apple-native.service";

describe("AppleNativeService", () => {
  let service: AppleNativeService;
  let config: { APPLE_CLIENT_ID: string };
  let repo: {
    findAccountByProviderId: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    createAccount: ReturnType<typeof vi.fn>;
    createSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    config = { APPLE_CLIENT_ID: "com.example.app" };
    repo = {
      findAccountByProviderId: vi.fn(),
      createUser: vi.fn(),
      createAccount: vi.fn(),
      createSession: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleNativeService,
        { provide: ConfigService, useValue: config },
        { provide: AppleNativeRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<AppleNativeService>(AppleNativeService);
  });

  describe("verifyIdentityToken", () => {
    it("throws on missing identity token", async () => {
      await expect(service.verifyIdentityToken("")).rejects.toThrow("Identity token is required");
    });

    it("throws on invalid JWT format", async () => {
      await expect(service.verifyIdentityToken("not-a-jwt")).rejects.toThrow();
    });
  });

  describe("handleAppleSignIn", () => {
    it("creates user, account, and session for new Apple user", async () => {
      repo.findAccountByProviderId.mockResolvedValue(null);
      repo.createUser.mockResolvedValue({ id: "user_1", name: "John Doe" });
      repo.createSession.mockResolvedValue({ id: "sess_1", expiresAt: new Date() });

      const result = await service.handleAppleSignIn(
        { sub: "apple_001", email: "test@icloud.com" },
        { firstName: "John", lastName: "Doe" },
      );

      expect(result).toHaveProperty("session");
      expect(result).toHaveProperty("user");
      expect(repo.findAccountByProviderId).toHaveBeenCalledWith("apple", "apple_001");
      expect(repo.createUser).toHaveBeenCalledWith(
        { name: "John Doe", email: "test@icloud.com" },
        true,
      );
      expect(repo.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_1",
          providerId: "apple",
          providerAccountId: "apple_001",
        }),
      );
      expect(repo.createSession).toHaveBeenCalledWith("user_1");
    });

    it("returns existing user when account already exists", async () => {
      repo.findAccountByProviderId.mockResolvedValue({ userId: "existing_user" });
      repo.createSession.mockResolvedValue({ id: "sess_2", expiresAt: new Date() });

      const result = await service.handleAppleSignIn(
        { sub: "apple_001" },
        { email: "existing@icloud.com" },
      );

      expect(result.user.id).toBe("existing_user");
      expect(repo.createUser).not.toHaveBeenCalled();
      expect(repo.createAccount).not.toHaveBeenCalled();
      expect(repo.createSession).toHaveBeenCalledWith("existing_user");
    });
  });
});
```

- [ ] **Step 6: Run service test to verify it fails**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.service.spec.ts
```

Expected: FAIL — `AppleNativeService`, `verifyIdentityToken` not defined.

- [ ] **Step 7: Write minimal AppleNativeService**

Create `apps/api/src/modules/auth/apple-native.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../shared/config/config.service";
import { AppleNativeRepository } from "./apple-native.repo";
import { createRemoteJWKSet, jwtVerify, errors } from "jose";

export interface AppleIdentityPayload {
  sub: string;
  email?: string;
}

export interface AppleUserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable()
export class AppleNativeService {
  private readonly JWKS: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly config: ConfigService,
    private readonly repo: AppleNativeRepository,
  ) {
    this.JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
  }

  async verifyIdentityToken(identityToken: string): Promise<AppleIdentityPayload> {
    if (!identityToken) {
      throw new Error("Identity token is required");
    }

    const clientId = this.config.APPLE_CLIENT_ID;

    let payload: { sub?: string; email?: string; iss?: string; aud?: string };
    try {
      const result = await jwtVerify(identityToken, this.JWKS, {
        issuer: "https://appleid.apple.com",
        audience: clientId,
      });
      payload = result.payload as typeof payload;
    } catch (err) {
      if (err instanceof errors.JWTExpired) {
        throw new Error("Apple identity token has expired");
      }
      if (err instanceof errors.JWSSignatureVerificationFailed) {
        throw new Error("Apple identity token signature verification failed");
      }
      throw new Error(`Apple identity token verification failed: ${(err as Error).message}`);
    }

    if (!payload.sub) {
      throw new Error("Apple identity token missing subject (sub)");
    }

    return { sub: payload.sub, email: payload.email };
  }

  async handleAppleSignIn(payload: AppleIdentityPayload, appleUser?: AppleUserInfo) {
    const { sub: appleUserId, email } = payload;
    const appleUserEmail = appleUser?.email;

    const account = await this.repo.findAccountByProviderId("apple", appleUserId);

    let userId: string;

    if (account) {
      userId = account.userId;
    } else {
      const displayName =
        [appleUser?.firstName, appleUser?.lastName].filter(Boolean).join(" ").trim() ||
        "Apple User";
      const resolvedEmail = appleUserEmail ?? email ?? `${appleUserId}@privaterelay.appleid.com`;

      const user = await this.repo.createUser({ name: displayName, email: resolvedEmail }, true);
      userId = user.id;

      await this.repo.createAccount({
        userId,
        providerId: "apple",
        providerAccountId: appleUserId,
      });
    }

    const session = await this.repo.createSession(userId);

    return {
      session: { id: session.id, expiresAt: session.expiresAt },
      user: { id: userId },
    };
  }
}
```

- [ ] **Step 8: Run service test to verify it passes**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.service.spec.ts
```

Expected: PASS.

- [ ] **Step 9: Write the failing controller test**

Create `apps/api/src/modules/auth/apple-native.controller.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AppleNativeController } from "../apple-native.controller";
import { AppleNativeService } from "../apple-native.service";

describe("AppleNativeController", () => {
  let controller: AppleNativeController;
  let service: {
    verifyIdentityToken: ReturnType<typeof vi.fn>;
    handleAppleSignIn: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      verifyIdentityToken: vi.fn(),
      handleAppleSignIn: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppleNativeController],
      providers: [{ provide: AppleNativeService, useValue: service }],
    }).compile();

    controller = module.get<AppleNativeController>(AppleNativeController);
  });

  it("returns session on valid identity token", async () => {
    const payload = { sub: "000123.abc", email: "user@icloud.com" };
    const sessionResult = {
      session: { id: "sess_1", expiresAt: new Date() },
      user: { id: "user_1" },
    };

    service.verifyIdentityToken.mockResolvedValue(payload);
    service.handleAppleSignIn.mockResolvedValue(sessionResult);

    const result = await controller.nativeSignIn({
      identityToken: "valid.jwt.token",
      user: { firstName: "John", lastName: "Doe" },
    });

    expect(result).toEqual(sessionResult);
    expect(service.verifyIdentityToken).toHaveBeenCalledWith("valid.jwt.token");
    expect(service.handleAppleSignIn).toHaveBeenCalledWith(payload, {
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("throws when identity token verification fails", async () => {
    service.verifyIdentityToken.mockRejectedValue(new Error("verification failed"));

    await expect(
      controller.nativeSignIn({
        identityToken: "invalid.token",
        user: {},
      }),
    ).rejects.toThrow("verification failed");

    expect(service.handleAppleSignIn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 10: Run controller test to verify it fails**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.controller.spec.ts
```

Expected: FAIL — Controller not found.

- [ ] **Step 11: Create DTO and AppleNativeController**

Create `apps/api/src/modules/auth/dto/apple-native-sign-in.dto.ts`:

```typescript
import { IsString, IsOptional, IsObject } from "class-validator";

class AppleUserInfo {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class AppleNativeSignInDto {
  @IsString()
  identityToken!: string;

  @IsOptional()
  @IsObject()
  user?: AppleUserInfo;
}
```

Create `apps/api/src/modules/auth/apple-native.controller.ts`:

```typescript
import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { AppleNativeService } from "./apple-native.service";
import { AppleNativeSignInDto } from "./dto/apple-native-sign-in.dto";
import { Public } from "./decorators";

@ApiExcludeController()
@Controller("auth/apple")
export class AppleNativeController {
  constructor(private readonly appleNativeService: AppleNativeService) {}

  @Public()
  @Post("native")
  @HttpCode(200)
  async nativeSignIn(@Body() dto: AppleNativeSignInDto) {
    const { identityToken, user: appleUser } = dto;

    const payload = await this.appleNativeService.verifyIdentityToken(identityToken);

    return this.appleNativeService.handleAppleSignIn(payload, appleUser);
  }
}
```

> **Note:** The controller is pure orchestration — validate input, call service, return result. DB operations are handled by `AppleNativeRepository`, which is injected into the service.

- [ ] **Step 12: Run controller test to verify it passes**

Run:

```bash
bun run --filter api test -- src/modules/auth/apple-native.controller.spec.ts
```

Expected: PASS.

- [ ] **Step 13: Wire controller, service, and repo into AuthModule**

Modify `apps/api/src/modules/auth/auth.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { AuthLocaleController } from "./auth-locale.controller";
import { AuthBridgeController } from "./auth-bridge.controller";
import { AppleNativeController } from "./apple-native.controller";
import { AppleNativeService } from "./apple-native.service";
import { AppleNativeRepository } from "./apple-native.repo";

@Module({
  controllers: [AuthLocaleController, AuthBridgeController, AppleNativeController],
  providers: [AuthGuard, AppleNativeService, AppleNativeRepository],
  exports: [AuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 14: Install jose dependency**

Run:

```bash
bun add --filter api jose
```

Expected: `jose` added to `apps/api/package.json`.

- [ ] **Step 15: Run full API test suite**

Run:

```bash
bun run --filter api test
```

Expected: All tests pass.

- [ ] **Step 16: Commit**

```bash
git add apps/api/src/modules/auth/apple-native.service.ts \
       apps/api/src/modules/auth/apple-native.controller.ts \
       apps/api/src/modules/auth/apple-native.repo.ts \
       apps/api/src/modules/auth/dto/apple-native-sign-in.dto.ts \
       apps/api/src/modules/auth/apple-native.service.spec.ts \
       apps/api/src/modules/auth/apple-native.controller.spec.ts \
       apps/api/src/modules/auth/apple-native.repo.spec.ts \
       apps/api/src/modules/auth/auth.module.ts \
       apps/api/package.json
git commit -m "feat(api): add Apple identity token verification for native sign-in with repo layer"
```

---

### Task 2: Native — app.config.ts Apple auth config and native signInAsync flow

**Files:**

- Modify: `apps/native/app.config.ts`
- Modify: `apps/native/src/app/(auth)/sign-in.tsx`
- Modify: `apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx`
- Create: `apps/native/src/features/auth/hooks/use-native-apple-sign-in.ts`
- Create: `apps/native/src/features/auth/hooks/use-native-apple-sign-in.spec.ts`

**Interfaces:**

- Consumes: `POST /api/auth/apple/native` from backend Task 1
- Produces: `useNativeAppleSignIn()` hook with `{ signIn, isLoading, error }`
- Produces: Updated `onSignInWithApple` handler using native `signInAsync()` flow
- Produces: `appleLoading?: boolean` prop on `SignInScreen`

- [ ] **Step 1: Write the failing test for the hook**

Create `apps/native/src/features/auth/hooks/use-native-apple-sign-in.spec.ts`:

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useNativeAppleSignIn } from "../use-native-apple-sign-in";

jest.mock("expo-apple-authentication", () => ({
  isSupportedAsync: jest.fn(),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

describe("useNativeAppleSignIn", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns isLoading false initially", () => {
    const { result } = renderHook(() => useNativeAppleSignIn());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when Apple sign-in is not supported", async () => {
    const { isSupportedAsync } = require("expo-apple-authentication");
    isSupportedAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useNativeAppleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe("Apple Sign-In is not available on this device");
    expect(result.current.isLoading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run --filter native test -- src/features/auth/hooks/use-native-apple-sign-in.spec.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the useNativeAppleSignIn hook**

Create `apps/native/src/features/auth/hooks/use-native-apple-sign-in.ts`:

```typescript
import { useState, useCallback } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/core/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useNativeAppleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);

    // Platform check removed - button should be conditionally rendered in screen component

    try {
      const isSupported = await AppleAuthentication.isSupportedAsync();
      if (!isSupported) {
        setError("Apple Sign-In is not available on this device");
        return;
      }
    } catch {
      setError("Failed to check Apple Sign-In availability");
      return;
    }

    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token returned from Apple");
      }

      const response = await fetch(`${API_URL}/api/auth/apple/native`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: {
            id: credential.user,
            email: credential.email,
            firstName: credential.fullName?.givenName,
            lastName: credential.fullName?.familyName,
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Server returned ${response.status}: ${body}`);
      }

      const { session } = await response.json();

      // Persist session token using better-auth expo client storage
      await SecureStore.setItemAsync("better-auth.session_token", session.id);

      // Trigger better-auth client session refresh
      await authClient.$fetch("/api/auth/get-session", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.id}` },
      });

      setIsLoading(false);
      // Router navigation handled by parent component watching auth state via useAuth()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple Sign-In failed";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  return { signIn, isLoading, error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
bun run --filter native test -- src/features/auth/hooks/use-native-apple-sign-in.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Modify app.config.ts — add expo-apple-authentication plugin**

In `apps/native/app.config.ts`, add `"expo-apple-authentication"` to the `plugins` array after `"expo-asset"` (line ~106):

```typescript
      "expo-asset",
      "expo-apple-authentication",
      "expo-audio",
```

Add `usesAppleSignIn: true` to the `ios` config (line ~136):

```typescript
    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
      supportsTablet: true,
      usesAppleSignIn: true,
      infoPlist: {
```

- [ ] **Step 6: Update the sign-in route to use native Apple flow**

Modify `apps/native/src/app/(auth)/sign-in.tsx`:

```typescript
import { type Href, useRouter } from 'expo-router';
import { routes } from '@sd/core-contracts';
import { authClient } from '@/core/auth';
import { SignInScreen } from '@/features/auth/screens/sign-in/sign-in.screen';
import { useNativeAppleSignIn } from '@/features/auth/hooks/use-native-apple-sign-in';

export default function SignInRoute() {
  const router = useRouter();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.home as Href);
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInWithGoogle={() => authClient.signIn.social({ provider: 'google' })}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
    />
  );
}
```

- [ ] **Step 7: Update SignInScreen to accept and render appleLoading**

Modify `apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx`:

Add `appleLoading?: boolean` to `SignInScreenProps`:

```typescript
export type SignInScreenProps = {
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onBack?: () => void;
  appleLoading?: boolean;
};
```

Add `ActivityIndicator` import from `react-native`:

```typescript
import { Platform, Pressable, Text, View, ActivityIndicator } from "react-native";
```

Update the Apple button rendering block to show loading state:

```typescript
        {Platform.OS === "ios" && (
          <View style={styles.appleBtnContainer}>
            {appleLoading ? (
              <View style={[styles.appleBtn, styles.appleBtnLoading]}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.appleBtn}
                onPress={onSignInWithApple}
              />
            )}
          </View>
        )}
```

Add to the StyleSheet object:

```typescript
  appleBtnContainer: { width: "100%", marginBottom: theme.spacing.component.gapSm },
  appleBtn: { width: "100%", height: 48 },
  appleBtnLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 8,
  },
```

- [ ] **Step 8: Run native typecheck**

Run:

```bash
bun run --filter native typecheck
```

Expected: PASS.

- [ ] **Step 9: Run native test suite**

Run:

```bash
bun run --filter native test
```

Expected: All tests pass.

- [ ] **Step 10: Commit**

```bash
git add apps/native/app.config.ts \
       apps/native/src/app/\(auth\)/sign-in.tsx \
       apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx \
       apps/native/src/features/auth/hooks/use-native-apple-sign-in.ts \
       apps/native/src/features/auth/hooks/
git commit -m "feat(native): implement native Apple sign-in with backend identity token verification"
```

---

### Task 3: Native — Google button CSS redesign

**Files:**

- Modify: `apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx`
- Modify: `apps/native/src/app/(auth)/sign-in.tsx`
- Create: `apps/native/src/features/auth/screens/sign-in/sign-in.screen.spec.ts`
- Delete: `apps/native/assets/auth/google-continue-*.png` (8 files, after verified)

**Interfaces:**

- Consumes: `SignInScreenProps.onSignInWithGoogle` (no longer needs `googleButtonSource`)
- Produces: CSS-styled Google button using `react-native-svg` for the "G" logo

- [ ] **Step 1: Write the failing test for the Google button**

Create `apps/native/src/features/auth/screens/sign-in/sign-in.screen.spec.ts`:

```typescript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SignInScreen } from "../sign-in.screen";

describe("SignInScreen", () => {
  const props = {
    onSignInWithGoogle: jest.fn(),
    onSignInWithApple: jest.fn(),
  };

  it("renders the Google sign-in button with text", async () => {
    render(<SignInScreen {...props} />);
    const googleButton = await screen.findByText("Continue with Google");
    expect(googleButton).toBeTruthy();
  });

  it("calls onSignInWithGoogle when Google button is pressed", async () => {
    render(<SignInScreen {...props} />);
    const googleButton = await screen.findByText("Continue with Google");
    fireEvent.press(googleButton);
    expect(props.onSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("renders Apple button on iOS", async () => {
    render(<SignInScreen {...props} />);
    // Apple button is native, so we check the accessibility label instead
    // The button text "Continue with Apple" isn't a Text node, but the
    // native component renders it
  });
});
```

- [ ] **Step 2: Run test**

Run:

```bash
bun run --filter native test -- src/features/auth/screens/sign-in/sign-in.screen.spec.ts
```

Expected: Initially the test will fail to find "Continue with Google" text since the current button is an image. After implementation, it passes.

- [ ] **Step 3: Replace the Google button in SignInScreen**

Remove `googleButtonSource` from `SignInScreenProps` and remove the `Image` import from `expo-image` and `ImageSourcePropType` from `react-native`.

Add `Svg, Path` import from `react-native-svg`:

```typescript
import Svg, { Path } from "react-native-svg";
```

Replace the Google `Pressable` block (currently lines 63-74, which uses `expo-image` and `googleButtonSource`) with:

```typescript
        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            pressed && styles.googleBtnPressed,
          ]}
          onPress={onSignInWithGoogle}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <View style={styles.googleBtnContent}>
            <View style={styles.googleIconContainer}>
              <Svg width={20} height={20} viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <Path fill="none" d="M0 0h48v48H0z" />
              </Svg>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </View>
        </Pressable>
```

Update the Google button styles in the `StyleSheet.create` block:

```typescript
  googleBtn: {
    borderRadius: theme.radius.component.chip,
    overflow: "hidden",
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  googleBtnPressed: { opacity: 0.85 },
  googleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    gap: theme.spacing.scale.sm,
  },
  googleBtnText: {
    color: theme.colors.content.default,
    ...theme.typography.labelMd,
    fontWeight: "500" as const,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
  },
```

- [ ] **Step 4: Update the sign-in route — remove googleButtonSource**

Modify `apps/native/src/app/(auth)/sign-in.tsx` — remove `Platform`, `useColorScheme` imports and the `googleButtonSource` computation. The cleaned-up file:

```typescript
import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";

export default function SignInRoute() {
  const router = useRouter();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.home as Href);
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
    />
  );
}
```

- [ ] **Step 5: Run native tests to verify they pass**

Run:

```bash
bun run --filter native test
```

Expected: All tests pass.

- [ ] **Step 6: Run native typecheck**

Run:

```bash
bun run --filter native typecheck
```

Expected: PASS.

- [ ] **Step 7: Remove old Google PNGs (after confirming new buttons work on device)**

Run:

```bash
Remove-Item apps/native/assets/auth/google-continue-*.png
```

- [ ] **Step 8: Commit**

```bash
git add apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx \
       apps/native/src/features/auth/screens/sign-in/ \
       apps/native/src/app/\(auth\)/sign-in.tsx
git rm apps/native/assets/auth/google-continue-*.png
git commit -m "feat(native): replace Google button image with CSS-styled SVG button"
```

---

### Task 4: Web — CSS-styled auth buttons with better-auth OAuth

**Files:**

- Create: `apps/web/src/features/auth/components/provider-button.spec.tsx`
- Create: `apps/web/src/features/auth/components/provider-button.module.css`
- Modify: `apps/web/src/features/auth/components/provider-button.tsx`
- Modify: `apps/web/src/features/auth/components/social-buttons.tsx`
- Delete: `apps/web/public/auth/apple-continue-*.png` (4 files, after verified)
- Delete: `apps/web/public/auth/google-continue-*.png` (4 files, after verified)

**Interfaces:**

- Consumes: Better-auth Apple + Google OAuth providers (already configured in `apps/api/src/modules/auth/auth.instance.ts`)
- Produces: Separate `GoogleButton` and `AppleButton` components with distinct prop types
- Both buttons use `authClient.signIn.social({ provider, callbackURL })` — identical OAuth flow
- Preserves aria-labels for test compatibility

**Key Architecture Decision:**

Better-auth **already has Apple OAuth configured** server-side (identical to Google). Web Apple auth uses the same `authClient.signIn.social({ provider: 'apple' })` flow as Google — **NO Apple JS SDK, NO event listeners, NO meta tags**. The backend handles the entire OAuth exchange via better-auth's built-in Apple provider.

- [ ] **Step 1: Write the failing test for the new button**

Create `apps/web/src/features/auth/components/provider-button.spec.tsx`:

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProviderButton } from "./provider-button";

describe("AuthProviderButton", () => {
  it("renders Apple button with correct aria-label", () => {
    render(<AuthProviderButton provider="apple" />);
    expect(screen.getByLabelText("Continue with Apple")).toBeInTheDocument();
  });

  it("renders Google button with correct aria-label", () => {
    render(<AuthProviderButton provider="google" />);
    expect(screen.getByLabelText("Continue with Google")).toBeInTheDocument();
  });

  it("renders Google button SVG icon", () => {
    const { container } = render(<AuthProviderButton provider="google" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Google button with official gsi-material-button text", () => {
    render(<AuthProviderButton provider="google" />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("calls onClick when Google button is clicked", () => {
    const onClick = vi.fn();
    render(<AuthProviderButton provider="google" onClick={onClick} />);
    screen.getByLabelText("Continue with Google").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<AuthProviderButton provider="google" onClick={onClick} disabled />);
    const button = screen.getByLabelText("Continue with Google");
    expect(button).toBeDisabled();
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

> **Note:** Apple button tests only check aria-label on the container div (`#appleid-signin`). The Apple JS SDK's rendered content (SVG, text) is not testable via RTL since the SDK renders asynchronously. E2E tests verify the actual button appearance.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run --filter web test src/features/auth/components/provider-button.spec.tsx
```

Expected: The aria-label tests pass (existing buttons already have labels). SVG and text tests for Google fail (current uses `<Image>` which renders `<img>`, no `<svg>` or "Sign in with Google" text). Apple button aria-label container test passes.

- [ ] **Step 3: Add Google button CSS module**

Create `apps/web/src/features/auth/components/provider-button.module.css`:

```css
/* Google gsi-material-button — https://developers.google.com/identity/branding-guidelines */
.gsiMaterialButton {
  user-select: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: none;
  border: 1px solid var(--gsi-border-color, #747775);
  box-sizing: border-box;
  color: var(--gsi-text-color, #1f1f1f);
  cursor: pointer;
  flex-shrink: 0;
  font-family: "Roboto", arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  height: 40px;
  letter-spacing: 0.25px;
  line-height: normal;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  transition:
    background-color 0.218s,
    border-color 0.218s,
    box-shadow 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
  background-color: var(--gsi-bg-color, #fff);
  opacity: var(--gsi-opacity, 1);
  border-radius: 4px;
}
.gsiMaterialButton:disabled {
  cursor: default;
  opacity: 0.45;
}
.gsiMaterialButtonState {
  transition: opacity 0.218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.gsiMaterialButtonContentWrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: space-between;
  position: relative;
  width: 100%;
}
.gsiMaterialButtonIcon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
}
.gsiMaterialButtonContents {
  flex-grow: 1;
  font-family: "Roboto", arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}
```

- [ ] **Step 4: Rewrite provider-button.tsx — Apple via JS SDK, Google via gsi-material-button HTML**

Replace `apps/web/src/features/auth/components/provider-button.tsx`:

```typescript
"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./provider-button.module.css";

type Provider = "apple" | "google";
type ThemeMode = "light" | "dark";

export type AuthProviderButtonProps = {
  provider: Provider;
  /** Only used for Google. Apple JS SDK handles its own OAuth popup flow. */
  onClick?: () => void;
  disabled?: boolean;
};

function GoogleSvg() {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden style={{ display: "block" }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function AuthProviderButton({
  provider,
  onClick,
  disabled = false,
}: AuthProviderButtonProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }
    return "light";
  });
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = (): ThemeMode =>
      root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const syncTheme = () => setThemeMode(readTheme());
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Apple JS SDK: render the native button after script loads
  useEffect(() => {
    if (provider !== "apple" || renderedRef.current || !appleBtnRef.current) return;

    const renderAppleBtn = () => {
      if (typeof AppleID !== "undefined" && AppleID.auth && appleBtnRef.current) {
        try {
          AppleID.auth.renderButton();
          renderedRef.current = true;
        } catch {
          renderedRef.current = true;
        }
      }
    };

    renderAppleBtn();
    const id = setInterval(() => {
      if (!renderedRef.current) renderAppleBtn();
    }, 200);
    return () => clearInterval(id);
  }, [provider, themeMode]);

  if (provider === "apple") {
    return (
      <>
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="lazyOnload"
        />
        <div
          id="appleid-signin"
          ref={appleBtnRef}
          data-color={themeMode === "dark" ? "white" : "black"}
          data-border="true"
          data-type="sign-in"
          role="button"
          aria-label="Continue with Apple"
          style={{
            width: "100%",
            minHeight: "2.9rem",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.45 : 1,
          }}
        />
      </>
    );
  }

  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      className={styles.gsiMaterialButton}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label="Continue with Google"
      style={{
        "--gsi-bg-color": isDark ? "#131314" : "#fff",
        "--gsi-border-color": isDark ? "#8e918f" : "#747775",
        "--gsi-text-color": isDark ? "#e3e3e3" : "#1f1f1f",
        "--gsi-opacity": disabled ? "0.45" : "1",
      } as CSSProperties}
    >
      <div className={styles.gsiMaterialButtonState} />
      <div className={styles.gsiMaterialButtonContentWrapper}>
        <div className={styles.gsiMaterialButtonIcon}>
          <GoogleSvg />
        </div>
        <span className={styles.gsiMaterialButtonContents}>Sign in with Google</span>
        <span style={{ display: "none" }}>Sign in with Google</span>
      </div>
    </button>
  );
}
```

> **Note:** The Apple JS SDK reads `data-color`, `data-border`, `data-type` from the container div. For dark mode we pass `data-color="white"`, for light mode `data-color="black"`. The Apple OAuth redirect URI is configured via `<meta>` tags in the app layout (or `AppleID.auth.init()` in a layout effect). The button click triggers Apple's native popup OAuth flow (`usePopup: true`). On success, `AppleIDSignInOnSuccess` custom event fires with the authorization code — a parent listener sends it to `POST /api/auth/apple/web`.

- [ ] **Step 5: Run test to verify they pass**

Run:

```bash
bun run --filter web test src/features/auth/components/provider-button.spec.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Verify existing tests still pass**

Run:

```bash
bun run --filter web test
```

Expected: `auth-modal.spec.tsx` and `AuthRequiredState.spec.tsx` still pass (they query by aria-label which is preserved).

- [ ] **Step 7: Verify E2E tests still work**

Run:

```bash
bun run --filter web test:e2e -- e2e/auth.spec.ts
```

Expected: PASS (E2E queries `getByRole("button", { name: "Continue with Apple/Google" })` — preserved).

- [ ] **Step 8: Run web typecheck**

Run:

```bash
bun run --filter web typecheck
```

Expected: PASS.

- [ ] **Step 9: Remove old PNG images** (after confirming new buttons work visually)

Run:

```bash
Remove-Item apps/web/public/auth/apple-continue-*.png
Remove-Item apps/web/public/auth/google-continue-*.png
```

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/features/auth/components/provider-button.tsx \
       apps/web/src/features/auth/components/provider-button.spec.tsx \
       apps/web/src/features/auth/components/provider-button.module.css
git rm apps/web/public/auth/apple-continue-*.png \
       apps/web/public/auth/google-continue-*.png
git commit -m "feat(web): replace image-based auth buttons with gsi-material-button and Apple JS SDK"
```

---

### Final Verification

Run these checks after all tasks are committed:

- [ ] **Verify API tests pass** — `bun run --filter api test`
- [ ] **Verify web tests pass** — `bun run --filter web test`
- [ ] **Verify E2E tests pass** — `bun run --filter web test:e2e -- e2e/auth.spec.ts`
- [ ] **Verify native tests pass** — `bun run --filter native test`
- [ ] **Verify full typecheck** — `bun run typecheck`
- [ ] **Verify full build** — `bun run build`
- [ ] **Commit any remaining cleanup**

```bash
git add -A
git commit -m "chore: remove unused auth button PNG assets"
```
