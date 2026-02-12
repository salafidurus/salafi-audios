import 'reflect-metadata';
import '@/shared/utils/env.bootstrap';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { AppModule } from './app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Salafi Durus API')
    .setDescription('Backend API for Salafi Durus')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Keep it deterministic for codegen
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));

  await app.close();
}

void generate().catch((error: unknown) => {
  const output =
    error instanceof Error
      ? `${error.stack ?? error.message}`
      : JSON.stringify(error, null, 2);

  process.stderr.write(`${output}\n`);
  process.exit(1);
});
