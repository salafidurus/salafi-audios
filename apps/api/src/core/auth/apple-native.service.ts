import { Injectable } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, errors } from 'jose';
import { ConfigService } from '../config/config.service';
import { AppleNativeRepository } from './apple-native.repo';

/** Core API apple native.service module providing shared backend infrastructure and authority-boundary services. */
/** API interface describing the apple identity payload contract. */
export interface AppleIdentityPayload {
  sub: string;
  email?: string;
}

/** API interface describing the apple user info contract. */
export interface AppleUserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable()
/** NestJS apple native service service or controller coordinating the API boundary for this responsibility. */
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
      // SAFETY: jwtVerify validated signature, issuer, and audience; the
      // Apple identity payload fields we read are standard JWT string claims.
      payload = result.payload as typeof payload;
    } catch (err) {
      if (err instanceof errors.JWTExpired) {
        throw new Error('Apple identity token has expired');
      }
      if (err instanceof errors.JWSSignatureVerificationFailed) {
        throw new Error('Apple identity token signature verification failed');
      }
      // SAFETY: the non-JOSE path here is still an Error-like thrown value from
      // verification; we only read its message for diagnostic context.
      throw new Error(`Apple identity token verification failed: ${(err as Error).message}`);
    }

    if (!payload.sub) {
      throw new Error('Apple identity token missing subject (sub)');
    }

    return { sub: payload.sub, email: payload.email };
  }

  async handleAppleSignIn(payload: AppleIdentityPayload, appleUser?: AppleUserInfo) {
    const { sub: appleUserId, email } = payload;

    const account = await this.repo.findAccountByProviderId('apple', appleUserId);

    const userId =
      account?.userId ?? (await this.createAppleUser(appleUserId, email, appleUser)).id;

    const session = await this.repo.createSession(userId);

    return {
      session: { id: session.id, expiresAt: session.expiresAt },
      user: { id: userId },
    };
  }

  private async createAppleUser(
    appleUserId: string,
    email: string | undefined,
    appleUser: AppleUserInfo | undefined,
  ) {
    const displayName =
      [appleUser?.firstName, appleUser?.lastName].filter(Boolean).join(' ').trim() || 'Apple User';
    const resolvedEmail = appleUser?.email ?? email ?? `${appleUserId}@privaterelay.appleid.com`;
    const user = await this.repo.createUser({ name: displayName, email: resolvedEmail }, true);
    await this.repo.createAccount({ userId: user.id, providerId: 'apple', accountId: appleUserId });
    return user;
  }
}
