import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage-provider.interface';
import { Inject } from '@nestjs/common';

const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
  ) {}

  async getPublicFeed(cursor?: string, limit = DEFAULT_PAGE_SIZE) {
    const images = await this.prisma.image.findMany({
      where: { isPublic: true, processingStatus: 'ready' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { displayName: true } },
        _count: { select: { bookmarks: true } },
      },
    });

    const hasMore = images.length > limit;
    const page = hasMore ? images.slice(0, limit) : images;

    const items = await Promise.all(
      page.map(async (image) => ({
        id: image.id,
        title: image.title,
        artist: image.user.displayName,
        width: image.width,
        height: image.height,
        thumbnailUrl: image.thumbnailKey
          ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
          : null,
        createdAt: image.createdAt,
        bookmarkCount: image._count.bookmarks,
      })),
    );

    return {
      items,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }
}
