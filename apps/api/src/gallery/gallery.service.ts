import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage-provider.interface';
import { Inject } from '@nestjs/common';

const DEFAULT_PAGE_SIZE = 20;

export type RankingPeriod = 'daily' | 'weekly' | 'monthly';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
  ) {}

  async getPublicFeed(
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
    tag?: string,
  ) {
    const images = await this.prisma.image.findMany({
      where: {
        isPublic: true,
        processingStatus: 'ready',
        ...(tag
          ? { tags: { some: { tag: { name: tag.toLowerCase() } } } }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { displayName: true } },
        _count: { select: { bookmarks: true } },
        tags: { include: { tag: true } },
      },
    });

    const hasMore = images.length > limit;
    const page = hasMore ? images.slice(0, limit) : images;

    const items = await Promise.all(
      page.map(async (image) => ({
        id: image.id,
        title: image.title,
        artist: { id: image.userId, displayName: image.user.displayName },
        width: image.width,
        height: image.height,
        bookmarkCount: image._count.bookmarks,
        tags: image.tags.map((it) => it.tag.name),
        thumbnailUrl: image.thumbnailKey
          ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
          : null,
        createdAt: image.createdAt,
      })),
    );

    return {
      items,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }

  private getPeriodStart(period: RankingPeriod): Date {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    switch (period) {
      case 'weekly':
        return new Date(now - 7 * dayMs);
      case 'monthly':
        return new Date(now - 30 * dayMs);
      default:
        return new Date(now - dayMs);
    }
  }

  async getRanking(period: RankingPeriod = 'daily', page = 1, limit = 20) {
    const since = this.getPeriodStart(period);
    const skip = (page - 1) * limit;

    const images = await this.prisma.image.findMany({
      where: {
        isPublic: true,
        processingStatus: 'ready',
        createdAt: { gte: since },
      },
      orderBy: [{ bookmarks: { _count: 'desc' } }, { createdAt: 'desc' }],
      skip,
      take: limit,
      include: {
        user: { select: { displayName: true } },
        _count: { select: { bookmarks: true } },
        tags: { include: { tag: true } },
      },
    });

    const items = await Promise.all(
      images.map(async (image, index) => ({
        rank: skip + index + 1,
        id: image.id,
        title: image.title,
        artist: { id: image.userId, displayName: image.user.displayName },
        width: image.width,
        height: image.height,
        bookmarkCount: image._count.bookmarks,
        tags: image.tags.map((it) => it.tag.name),
        thumbnailUrl: image.thumbnailKey
          ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
          : null,
        createdAt: image.createdAt,
      })),
    );

    return { period, page, items };
  }

  async getArtistFeed(
    artistId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ) {
    const artist = await this.prisma.user.findUnique({
      where: { id: artistId },
      select: { id: true, displayName: true },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const images = await this.prisma.image.findMany({
      where: { userId: artistId, isPublic: true, processingStatus: 'ready' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        _count: { select: { bookmarks: true } },
        tags: { include: { tag: true } },
      },
    });

    const hasMore = images.length > limit;
    const page = hasMore ? images.slice(0, limit) : images;

    const items = await Promise.all(
      page.map(async (image) => ({
        id: image.id,
        title: image.title,
        width: image.width,
        height: image.height,
        bookmarkCount: image._count.bookmarks,
        tags: image.tags.map((it) => it.tag.name),
        thumbnailUrl: image.thumbnailKey
          ? await this.storageProvider.getReadStreamUrl(image.thumbnailKey)
          : null,
        createdAt: image.createdAt,
      })),
    );

    return {
      artist: { id: artist.id, displayName: artist.displayName },
      items,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }
}
