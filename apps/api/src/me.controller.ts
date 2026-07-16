import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { StorageService } from './storage.service';
import { JwtUser } from './auth/types/types';

interface RequestWithUser extends Request {
  user: JwtUser;
}

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private storageService: StorageService) {}

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
}
