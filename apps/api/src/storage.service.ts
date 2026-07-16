import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { storageUsedBytes: true, storageQuotaBytes: true },
    });
    return user;
  }

  async incrementStorageUsed(userId: string, bytes: bigint) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { storageUsedBytes: { increment: bytes } },
    });
  }

  async decrementStorageUsed(userId: string, bytes: bigint) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { storageUsedBytes: { decrement: bytes } },
    });
  }
}
