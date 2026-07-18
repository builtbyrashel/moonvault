import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { StorageModule } from '../storage/storage.module';
import { ProcessingModule } from '../processing/processing.module';

@Module({
  imports: [StorageModule, ProcessingModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
