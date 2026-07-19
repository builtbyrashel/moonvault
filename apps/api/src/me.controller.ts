import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { StorageService } from './storage.service';
import { UploadsService } from './uploads/uploads.service';
import { JwtUser } from './auth/types/types';

interface RequestWithUser extends Request {
  user: JwtUser;
}

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private storageService: StorageService,
    private uploadsService: UploadsService,
  ) {}

  @Get('storage')
  async getStorage(@Req() req: RequestWithUser) {
    const { storageUsedBytes, storageQuotaBytes } =
      await this.storageService.getUsage(req.user.userId);

    const usedBytes = Number(storageUsedBytes);
    const quotaBytes = Number(storageQuotaBytes);

    return {
      usedBytes,
      quotaBytes,
      percentUsed: Math.round((usedBytes / quotaBytes) * 100 * 100) / 100,
    };
  }

  @Get('uploads')
  async getMyUploads(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(Number(limit), 50) : undefined;
    return this.uploadsService.getMyUploads(
      req.user.userId,
      cursor,
      parsedLimit,
    );
  }
}
