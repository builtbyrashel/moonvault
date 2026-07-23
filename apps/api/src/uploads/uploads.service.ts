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

  private parseTagNames(raw?: string): string[] {
    if (!raw) return [];
    return [
      ...new Set(
        raw
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0),
      ),
    ];
  }

  private async attachTags(imageId: string, tagNames: string[]) {
    for (const name of tagNames) {
      const tag = await this.prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await this.prisma.imageTag.upsert({
        where: { imageId_tagId: { imageId, tagId: tag.id } },
        create: { imageId, tagId: tag.id },
        update: {},
      });
    }
  }

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

    const tagNames = this.parseTagNames(dto.tags);
    await this.attachTags(image.id, tagNames);
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
      include: {
        _count: { select: { bookmarks: true } },
        tags: { include: { tag: true } },
        user: { select: { id: true, displayName: true } },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (!image.isPublic && image.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    const isBookmarked = await this.prisma.bookmark
      .findUnique({
        where: { userId_imageId: { userId: requestingUserId, imageId } },
      })
      .then((b) => b !== null);

    const url = await this.storageProvider.getReadStreamUrl(image.storageKey);
    const thumbnailUrl = image.thumbnailKey
      ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
      : null;

    return {
      id: image.id,
      title: image.title,
      artist: { id: image.user.id, displayName: image.user.displayName },
      isPublic: image.isPublic,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      processingStatus: image.processingStatus,
      width: image.width,
      height: image.height,
      exif: image.exifData,
      duplicateOfId: image.duplicateOfId,
      bookmarkCount: image._count.bookmarks,
      isBookmarked,
      isOwner: image.userId === requestingUserId,
      tags: image.tags.map((it) => it.tag.name),
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

  async addBookmark(imageId: string, userId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    if (!image.isPublic && image.userId !== userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    await this.prisma.bookmark.upsert({
      where: { userId_imageId: { userId, imageId } },
      create: { userId, imageId },
      update: {},
    });

    return { bookmarked: true };
  }

  async removeBookmark(imageId: string, userId: string) {
    await this.prisma.bookmark.deleteMany({
      where: { userId, imageId },
    });
    return { bookmarked: false };
  }

  async getMyUploads(userId: string, cursor?: string, limit = 20) {
    const images = await this.prisma.image.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { tags: { include: { tag: true } } },
    });

    const hasMore = images.length > limit;
    const page = hasMore ? images.slice(0, limit) : images;

    const items = await Promise.all(
      page.map(async (image) => ({
        id: image.id,
        title: image.title,
        isPublic: image.isPublic,
        processingStatus: image.processingStatus,
        width: image.width,
        height: image.height,
        sizeBytes: image.sizeBytes,
        tags: image.tags.map((it) => it.tag.name),
        thumbnailUrl: image.thumbnailKey
          ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
          : null,
        createdAt: image.createdAt,
        duplicateOfId: image.duplicateOfId,
      })),
    );

    return {
      items,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }

  async updateImage(
    imageId: string,
    requestingUserId: string,
    updates: { title?: string; isPublic?: boolean; tags?: string },
  ) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    if (image.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    await this.prisma.image.update({
      where: { id: imageId },
      data: {
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.isPublic !== undefined
          ? { isPublic: updates.isPublic }
          : {}),
      },
    });

    if (updates.tags !== undefined) {
      const tagNames = this.parseTagNames(updates.tags);
      await this.prisma.imageTag.deleteMany({ where: { imageId } });
      await this.attachTags(imageId, tagNames);
    }

    return this.getById(imageId, requestingUserId);
  }
}
