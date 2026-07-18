import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage-provider.interface';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
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
}
