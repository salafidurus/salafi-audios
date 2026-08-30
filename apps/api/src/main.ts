import './shared/utils/env.bootstrap';
import type { IncomingMessage } from 'node:http';
import type { Http2ServerRequest } from 'node:http2';
// ESM Module Resolution Gating under Bun:
// NestJS 12 packages are pure ESM modules. To prevent runtime `TypeError: require() async module ... is unsupported`
// errors when CommonJS companion dependencies
// synchronously call `require('@nestjs/common')` during execution, we must explicitly import the core ES modules first.
// This forces Bun to evaluate the NestJS core ESM graph synchronously at startup so subsequent CJS requires succeed.
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from './core/config/config.service';
import { AllExceptionsFilter } from './shared/errors/http-exception.filter';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiLogController } from './core/logger/api-log.controller';
import { AppLoggerService } from './core/logger/app-logger.service';
import {
  generateRequestId,
  getSharedApiLogger,
  REQUEST_ID_HEADER,
} from './core/logger/logger.factory';
import { initAuth, getAuth } from './core/auth/auth.instance';
import { fromNodeHeaders } from 'better-auth/node';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { RedisService } from './core/redis/redis.service';
import { getApiEnv } from './core/config/env';
import { getRateLimitPolicy } from './core/security/rate-limit.policy';

/** API bootstrap entrypoint that configures the NestJS server and shared request infrastructure. */
async function bootstrap() {
  const env = getApiEnv(process.env);
  const bootstrapConfig = new ConfigService();
  const sharedLogger = getSharedApiLogger(bootstrapConfig.NODE_ENV);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      loggerInstance: sharedLogger,
      trustProxy: (_address, hop) => hop < env.TRUST_PROXY_HOPS,
      genReqId: (request: IncomingMessage | Http2ServerRequest) =>
        generateRequestId(request.headers),
      logController: new ApiLogController(),
    }),
    { bufferLogs: true },
  );
  const config = app.get(ConfigService);
  const redis = app.get(RedisService);
  // SAFETY: NestFactory is configured with FastifyAdapter immediately above.
  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;
  await app.register(rateLimit, {
    global: false,
    redis: redis.rawClient,
    nameSpace: `${redis.namespace}rate-limit:`,
  });
  const globalSafetyLimiter = fastify.rateLimit({
    max: getRateLimitPolicy('global-safety', config.NODE_ENV).limit,
    timeWindow: getRateLimitPolicy('global-safety', config.NODE_ENV).timeWindowMs,
    skipOnError: getRateLimitPolicy('global-safety', config.NODE_ENV).failureMode === 'open',
    keyGenerator: (request) => `global-safety:ip:${request.ip}`,
  });
  const authenticationPolicy = getRateLimitPolicy('authentication', config.NODE_ENV);
  initAuth(config);

  app.useLogger(app.get(AppLoggerService));

  // SAFETY: NestFastifyApplication is constructed with FastifyAdapter above, so
  // its HTTP adapter instance is the Fastify instance used for these hooks.
  fastify.addHook('onRequest', (request, reply, done) => {
    reply.header(REQUEST_ID_HEADER, request.id);
    done();
  });

  // Security: Helmet with proper CSP configuration
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI libraries
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'], // Allow external images
        connectSrc: ["'self'"], // API calls
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:'], // Allow media from CDN
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // For Swagger docs
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // For media serving
  });

  // Cookie parsing
  await app.register(cookie, { secret: config.BETTER_AUTH_SECRET });

  // CORS: Same-domain setup (frontend and backend on same domain)
  await app.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Cookie'],
    exposedHeaders: ['X-Request-Id', 'Set-Cookie'],
    maxAge: 86400,
  });

  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ConfigService)));

  // Mount Better Auth as a Fastify route (not raw middleware). Raw middleware
  // bypasses @fastify/cors onRequest hooks, so preflight OPTIONS to /api/auth/*
  // returned no CORS headers. A proper route stays inside Fastify's hook
  // pipeline, letting the CORS plugin handle preflight automatically. See
  // https://better-auth.com/docs/integrations/fastify
  // SAFETY: this Nest app is bootstrapped with the Fastify adapter above, so
  // the underlying HTTP adapter instance is a Fastify server here.
  fastify.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    url: '/api/auth/*',
    preHandler: [
      globalSafetyLimiter,
      fastify.rateLimit({
        max: authenticationPolicy.limit,
        timeWindow: authenticationPolicy.timeWindowMs,
        skipOnError: authenticationPolicy.failureMode === 'open',
        keyGenerator: (request) => `authentication:ip:${request.ip}`,
      }),
    ],
    async handler(request: FastifyRequest, reply: FastifyReply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);
      const requestInit: RequestInit = {
        method: request.method,
        headers,
      };
      if (request.body) {
        requestInit.body = JSON.stringify(request.body);
      }
      const req = new Request(url.toString(), requestInit);
      if (request.body) {
        req.headers.set('content-type', 'application/json');
      }

      try {
        const response = await getAuth().handler(req);
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        // Safe: proxying Better Auth's handler response. Better Auth is a trusted
        // authentication library responsible for its own output sanitization. This
        // is not rendering user-provided content directly.
        // nosemgrep: javascript.express.security.audit.xss.direct-response-write.direct-response-write
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        // SAFETY: Better Auth throws Error instances for handler failures and
        // pino expects an Error object for structured error logging.
        fastify.log.error(error as Error, 'Authentication Error:');
        return reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        });
      }
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Salafi Durus API')
    .setDescription('Backend API for Salafi Durus')
    .setVersion('1.0.0')
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.PORT, '0.0.0.0');
}

void bootstrap();
