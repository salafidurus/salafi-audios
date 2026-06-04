import { Injectable } from "@nestjs/common";
import { getLiveEnv } from "./env";

@Injectable()
export class LiveConfigService {
  private readonly env = getLiveEnv(process.env);

  get NODE_ENV() {
    return this.env.NODE_ENV;
  }

  get PORT() {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get apiUrl(): string {
    return this.env.API_URL;
  }

  get livestreamSecret(): string {
    return this.env.LIVESTREAM_SECRET;
  }

  get telegramApiId(): number {
    return this.env.TELEGRAM_API_ID;
  }

  get telegramApiHash(): string {
    return this.env.TELEGRAM_API_HASH;
  }

  get telegramSession(): string {
    return this.env.TELEGRAM_SESSION;
  }

  get internalSecret(): string {
    return this.env.INTERNAL_SECRET;
  }
}
