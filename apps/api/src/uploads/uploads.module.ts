// uploads.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { StorageModule } from '../storage/storage.module';
import { ProcessingModule } from '../processing/processing.module';

@Module({
  imports: [forwardRef(() => StorageModule), ProcessingModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService], // ← ADD THIS LINE
})
export class UploadsModule {}
