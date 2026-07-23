import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types/types';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface RequestWithUser extends Request {
  user: JwtUser;
}

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Patch('profile')
  updateProfile(@Body() dto: UpdateProfileDto, @Req() req: RequestWithUser) {
    return this.profileService.updateDisplayName(
      req.user.userId,
      dto.displayName,
    );
  }

  @Patch('password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: RequestWithUser) {
    return this.profileService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
