import { Injectable } from "@nestjs/common";

@Injectable()
export class LiveConfigService {
  get telegramApiId(): number {
    return Number(process.env.TELEGRAM_API_ID ?? "0");
  }

  get telegramApiHash(): string {
    return process.env.TELEGRAM_API_HASH ?? "";
  }

  get telegramSession(): string {
    return process.env.TELEGRAM_SESSION ?? "";
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL ?? "";
  }
}
