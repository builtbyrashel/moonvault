import { Controller, Get, Query, Param } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  // GET /gallery/tags - must be declared before the bare @Get() to avoid route conflicts
  @Get('tags')
  async getTags() {
    return this.galleryService.getTagList();
  }

  // GET /gallery - main feed with filters
  @Get()
  async getFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('orientation') orientation?: string,
  ) {
    const parsedLimit = limit ? Math.min(Number(limit), 50) : undefined;
    return this.galleryService.getPublicFeed(
      cursor,
      parsedLimit,
      tag,
      orientation,
    );
  }

  // GET /gallery/ranking - popularity ranking
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

  // GET /gallery/artists/:id - artist-specific feed
  @Get('artists/:id')
  async getArtist(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(Number(limit), 50) : undefined;
    return this.galleryService.getArtistFeed(id, cursor, parsedLimit);
  }
}
