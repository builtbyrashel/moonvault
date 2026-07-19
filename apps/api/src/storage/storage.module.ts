import { Module, forwardRef } from '@nestjs/common';
import { StorageService } from '../storage.service';
import { MeController } from '../me.controller';
import { STORAGE_PROVIDER } from './storage-provider.interface';
import { LocalDiskStorageProvider } from './local-disk-storage.provider';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [forwardRef(() => UploadsModule)],
  controllers: [MeController],
  providers: [
    StorageService,
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalDiskStorageProvider,
    },
  ],
  exports: [StorageService, STORAGE_PROVIDER],
})
export class StorageModule {}
