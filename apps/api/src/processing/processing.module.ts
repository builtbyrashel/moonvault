import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessingQueueService } from './processing-queue.service';
import { ImageProcessor } from './image.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image-processing',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    }),
    PrismaModule,
    forwardRef(() => StorageModule),
  ],
  providers: [ProcessingQueueService, ImageProcessor],
  exports: [ProcessingQueueService],
})
export class ProcessingModule {}
