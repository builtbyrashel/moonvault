import { Module } from '@nestjs/common';
import { StorageService } from '../storage.service';
import { MeController } from '../me.controller';
import { STORAGE_PROVIDER } from './storage-provider.interface';
import { LocalDiskStorageProvider } from './local-disk-storage.provider';

@Module({
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
