import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });

    const [uploadCount, publicUploadCount, totalBookmarksReceived] =
      await Promise.all([
        this.prisma.image.count({ where: { userId } }),
        this.prisma.image.count({ where: { userId, isPublic: true } }),
        this.prisma.bookmark.count({ where: { image: { userId } } }),
      ]);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      memberSince: user.createdAt,
      stats: { uploadCount, publicUploadCount, totalBookmarksReceived },
    };
  }

  async updateDisplayName(userId: string, displayName: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });
    return this.getProfile(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  }
}
