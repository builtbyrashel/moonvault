import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage-provider.interface';
import { UploadImageDto } from './dto/upload-image.dto';
import { ProcessingQueueService } from '../processing/processing-queue.service';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
    private processingQueue: ProcessingQueueService,
  ) {}

  async handleUpload(
    userId: string,
    file: Express.Multer.File,
    dto: UploadImageDto,
  ) {
    const key = `users/${userId}/${randomUUID()}-${file.originalname}`;

    const { sizeBytes } = await this.storageProvider.upload(
      file.buffer,
      key,
      file.mimetype,
    );

    const image = await this.prisma.image.create({
      data: {
        userId,
        storageKey: key,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes,
        isPublic: dto.isPublic ?? false,
        title: dto.title,
      },
    });

    await this.processingQueue.enqueueImageProcessing(image.id);
    await this.storageService.incrementStorageUsed(userId, BigInt(sizeBytes));

    return {
      id: image.id,
      storageKey: image.storageKey,
      sizeBytes: image.sizeBytes,
      isPublic: image.isPublic,
      title: image.title,
      createdAt: image.createdAt,
    };
  }

  async getById(imageId: string, requestingUserId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (!image.isPublic && image.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    const url = await this.storageProvider.getReadStreamUrl(image.storageKey);
    const thumbnailUrl = image.thumbnailKey
      ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
      : null;

    return {
      id: image.id,
      title: image.title,
      isPublic: image.isPublic,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      processingStatus: image.processingStatus,
      width: image.width,
      height: image.height,
      exif: image.exifData,
      duplicateOfId: image.duplicateOfId,
      url,
      thumbnailUrl,
    };
  }

  async deleteById(imageId: string, requestingUserId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    await this.storageProvider.delete(image.storageKey);
    await this.prisma.image.delete({ where: { id: imageId } });
    await this.storageService.decrementStorageUsed(
      requestingUserId,
      BigInt(image.sizeBytes),
    );

    return { deleted: true };
  }
}
