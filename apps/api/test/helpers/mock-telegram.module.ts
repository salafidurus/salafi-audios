import { Global, Module, Injectable } from '@nestjs/common';
import { TelegramService } from '../../src/modules/telegram/telegram.service';

@Injectable()
class MockTelegramService {
  getClient() {
    return null;
  }
  isConnected() {
    return false;
  }
  onModuleInit() {}
  onModuleDestroy() {}
}

@Global()
@Module({
  providers: [
    {
      provide: TelegramService,
      useClass: MockTelegramService,
    },
  ],
  exports: [TelegramService],
})
export class MockTelegramModule {}
