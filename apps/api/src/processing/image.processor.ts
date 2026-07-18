import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage-provider.interface';

interface ProcessImageJobData {
  imageId: string;
}

@Processor('image-processing')
export class ImageProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
  ) {
    super();
  }

  async process(job: Job<ProcessImageJobData>): Promise<void> {
    const { imageId } = job.data;

    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      this.logger.warn(`Image ${imageId} not found, skipping`);
      return;
    }

    await this.prisma.image.update({
      where: { id: imageId },
      data: { processingStatus: 'processing' },
    });

    try {
      const original = await this.storageProvider.download(image.storageKey);
      const metadata = await sharp(original).metadata();

      const thumbnailBuffer = await sharp(original)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbnailKey = `${image.storageKey}-thumb.webp`;
      await this.storageProvider.upload(
        thumbnailBuffer,
        thumbnailKey,
        'image/webp',
      );

      await this.prisma.image.update({
        where: { id: imageId },
        data: {
          width: metadata.width ?? null,
          height: metadata.height ?? null,
          thumbnailKey,
          processingStatus: 'ready',
        },
      });
    } catch (err) {
      this.logger.error(`Processing failed for image ${imageId}`, err);
      await this.prisma.image.update({
        where: { id: imageId },
        data: { processingStatus: 'failed' },
      });
      throw err; // rethrow so BullMQ records the job as failed, not silently swallowed
    }
  }
}
