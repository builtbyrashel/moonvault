import { Controller, Get, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  async getFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
  ) {
    const parsedLimit = limit ? Math.min(Number(limit), 50) : undefined;
    return this.galleryService.getPublicFeed(cursor, parsedLimit, tag);
  }

  @Get('ranking')
  async getRanking(
    @Query('period') period?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    const parsedPeriod = validPeriods.includes(period ?? '')
      ? (period as 'daily' | 'weekly' | 'monthly')
      : 'daily';
    const parsedPage = page ? Math.max(Number(page), 1) : 1;
    const parsedLimit = limit ? Math.min(Number(limit), 50) : 20;
    return this.galleryService.getRanking(
      parsedPeriod,
      parsedPage,
      parsedLimit,
    );
  }
}
