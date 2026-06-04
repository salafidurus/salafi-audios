import "./shared/utils/env.bootstrap";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./shared/errors/http-exception.filter";
import { LiveConfigService } from "./shared/config/config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(LiveConfigService);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(config));

  await app.listen(config.PORT);
  new Logger("Bootstrap").log(`Livestreams service running on port ${config.PORT}`);
}

void bootstrap();
