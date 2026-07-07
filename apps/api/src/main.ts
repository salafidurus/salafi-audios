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
import { toNodeHandler } from 'better-auth/node';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
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
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ConfigService)));

  // Mount better-auth as Fastify middleware — handles all /api/auth/* routes
  // before NestJS routing, bypassing ValidationPipe and wildcard issues.
  app.use('/api/auth', toNodeHandler(getAuth()));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Salafi Durus API')
    .setDescription('Backend API for Salafi Durus')
    .setVersion('1.0.0')
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // TCP microservice listener — dormant until @MessagePattern handlers are added.
  // Split-later: extract TelegramModule to a separate process pointing at this port.
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 5001 },
  });
  await app.startAllMicroservices();

  await app.listen(config.PORT);
}

void bootstrap();
