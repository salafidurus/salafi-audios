import { Module } from '@nestjs/common';
import { MyLibraryController } from './my-library.controller';
import { MyLibraryService } from './my-library.service';
import { MyLibraryRepository } from './my-library.repo';
import { ListingModule } from '../listing/listing.module';

@Module({
  imports: [ListingModule],
  controllers: [MyLibraryController],
  providers: [MyLibraryService, MyLibraryRepository],
  exports: [MyLibraryService],
})
export class MyLibraryModule {}
