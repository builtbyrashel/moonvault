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

    return {
      id: image.id,
      title: image.title,
      isPublic: image.isPublic,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      url,
    };
  }
}
