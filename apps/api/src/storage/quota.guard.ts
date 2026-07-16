import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { StorageService } from '../storage.service';
import { JwtUser } from '../auth/types/types';

interface RequestWithUser extends Request {
  user: JwtUser;
  headers: Request['headers'] & { 'content-length'?: string };
}

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private storageService: StorageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const incomingBytes = BigInt(req.headers['content-length'] ?? '0');

    const { storageUsedBytes, storageQuotaBytes } =
      await this.storageService.getUsage(req.user.userId);

    if (storageUsedBytes + incomingBytes > storageQuotaBytes) {
      throw new ForbiddenException(
        'This upload would exceed your storage quota.',
      );
    }

    return true;
  }
}
