import { Injectable } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, errors } from 'jose';
import { ConfigService } from '../config/config.service';
import { AppleNativeRepository } from './apple-native.repo';

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
    this.JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
  }

  async verifyIdentityToken(identityToken: string): Promise<AppleIdentityPayload> {
    if (!identityToken) {
      throw new Error('Identity token is required');
    }

    const clientId = this.config.APPLE_CLIENT_ID;

    let payload: { sub?: string; email?: string; iss?: string; aud?: string };
    try {
      const result = await jwtVerify(identityToken, this.JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: clientId,
      });
      payload = result.payload as typeof payload;
    } catch (err) {
      if (err instanceof errors.JWTExpired) {
        throw new Error('Apple identity token has expired');
      }
      if (err instanceof errors.JWSSignatureVerificationFailed) {
        throw new Error('Apple identity token signature verification failed');
      }
      throw new Error(`Apple identity token verification failed: ${(err as Error).message}`);
    }

    if (!payload.sub) {
      throw new Error('Apple identity token missing subject (sub)');
    }

    return { sub: payload.sub, email: payload.email };
  }

  async handleAppleSignIn(payload: AppleIdentityPayload, appleUser?: AppleUserInfo) {
    const { sub: appleUserId, email } = payload;
    const appleUserEmail = appleUser?.email;

    const account = await this.repo.findAccountByProviderId('apple', appleUserId);

    let userId: string;

    if (account) {
      userId = account.userId;
    } else {
      const displayName =
        [appleUser?.firstName, appleUser?.lastName].filter(Boolean).join(' ').trim() ||
        'Apple User';
      const resolvedEmail = appleUserEmail ?? email ?? `${appleUserId}@privaterelay.appleid.com`;

      const user = await this.repo.createUser({ name: displayName, email: resolvedEmail }, true);
      userId = user.id;

      await this.repo.createAccount({
        userId,
        providerId: 'apple',
        accountId: appleUserId,
      });
    }

    const session = await this.repo.createSession(userId);

    return {
      session: { id: session.id, expiresAt: session.expiresAt },
      user: { id: userId },
    };
  }
}
