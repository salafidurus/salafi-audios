import { Controller, Get, Query, Req, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { IncomingHttpHeaders } from 'http';
import type { FastifyRequest } from 'fastify';
import { ConfigService } from '../../shared/config/config.service';
import { getAuth } from './auth.instance';
import { Public } from './decorators';

// Convert Node/Express request headers into a Fetch `Headers` for Better Auth.
// Mirrors AuthGuard's approach (no `better-auth/node` import, which is ESM-only
// and breaks the Jest transform).
function toFetchHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value != null) {
      headers.set(key, value);
    }
  }
  return headers;
}

// Cross-site OAuth handoff bridge.
//
// Browsers cannot send the API's session cookie on cross-site requests, so the
// web SPA authenticates by bearer token instead. Immediately after social OAuth
// the browser is on the API origin holding a first-party session cookie; this
// endpoint mints a single-use one-time token there and redirects to the web app
// with it in the URL, where the SPA exchanges it for a bearer token. The
// redirect target is restricted to configured web origins to prevent open
// redirects, and no token is minted for an untrusted target.
@ApiExcludeController()
@Controller('auth-bridge')
export class AuthBridgeController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get('oauth-complete')
  @Redirect()
  async oauthComplete(
    @Query('redirect') redirect: string | undefined,
    @Req() req: FastifyRequest,
  ): Promise<{ url: string; statusCode: number }> {
    const fallback = `${this.config.CORS_ORIGINS[0] ?? ''}/sign-in`;

    const target = this.resolveAllowedRedirect(redirect);
    // nosemgrep: typescript.nestjs.security.audit.nestjs-open-redirect.nestjs-open-redirect
    if (!target) return { url: fallback, statusCode: 302 };

    let token: string | undefined;
    try {
      const result = await getAuth().api.generateOneTimeToken({
        headers: toFetchHeaders(req.headers),
      });
      token = result?.token;
    } catch {
      token = undefined;
    }

    // nosemgrep: typescript.nestjs.security.audit.nestjs-open-redirect.nestjs-open-redirect
    if (!token) return { url: fallback, statusCode: 302 };

    const sep = target.includes('?') ? '&' : '?';
    // nosemgrep: javascript.express.web.tainted-redirect-express.tainted-redirect-express, typescript.nestjs.security.audit.nestjs-open-redirect.nestjs-open-redirect
    return { url: `${target}${sep}ott=${encodeURIComponent(token)}`, statusCode: 302 };
  }

  private resolveAllowedRedirect(redirect: string | undefined): string | null {
    if (!redirect) return null;

    let parsed: URL;
    try {
      parsed = new URL(redirect);
    } catch {
      return null;
    }

    const matchedOrigin = this.config.CORS_ORIGINS.find((origin) => origin === parsed.origin);
    if (!matchedOrigin) return null;

    // Reconstruct the URL using the matched origin (never redirect to raw user input)
    return `${matchedOrigin}${parsed.pathname}${parsed.search}`;
  }
}
