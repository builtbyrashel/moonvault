import { Module } from '@nestjs/common';
import { StorageService } from '../storage.service';
import { MeController } from '../me.controller';

@Module({
  controllers: [MeController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
