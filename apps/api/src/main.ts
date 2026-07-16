import './shared/utils/env.bootstrap';
import { ConfigService } from './shared/config/config.service';
import { AllExceptionsFilter } from './shared/errors/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { initAuth, getAuth } from './modules/auth/auth.instance';
import { fromNodeHeaders } from 'better-auth/node';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }), // Disable Fastify's logger, use Pino instead
    { bufferLogs: true },
  );
  const config = app.get(ConfigService);
  initAuth(config);

  app.useLogger(app.get(Logger));

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
    exposedHeaders: ['X-Request-Id', 'Set-Cookie', 'set-auth-token'],
    maxAge: 86400,
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ConfigService)));

  // Mount Better Auth as a Fastify route (not raw middleware). Raw middleware
  // bypasses @fastify/cors onRequest hooks, so preflight OPTIONS to /api/auth/*
  // returned no CORS headers. A proper route stays inside Fastify's hook
  // pipeline, letting the CORS plugin handle preflight automatically. See
  // https://better-auth.com/docs/integrations/fastify
  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;
  fastify.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    url: '/api/auth/*',
    async handler(request: FastifyRequest, reply: FastifyReply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

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

  // TCP microservice listener — reserved for future microservice-based workers.
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 5001 },
  });
  await app.startAllMicroservices();

  await app.listen(config.PORT);
}

void bootstrap();
