import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryRepository } from './library.repo';

@Module({
  controllers: [LibraryController],
  providers: [LibraryService, LibraryRepository],
  exports: [LibraryService],
})
export class LibraryModule {}
