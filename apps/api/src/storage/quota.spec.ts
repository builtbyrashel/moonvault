import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { QuotaGuard } from './quota.guard';
import { StorageService } from '../storage.service';
import { PrismaService } from '../prisma/prisma.service';

function createMockContext(
  headers: Record<string, string | undefined>,
  userId = 'user-1',
): ExecutionContext {
  const req = {
    headers,
    user: { userId, email: 'test@moonvault.dev' },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
}

describe('QuotaGuard', () => {
  let guard: QuotaGuard;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    storageService = {
      getUsage: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;
    guard = new QuotaGuard(storageService);
  });

  it('allows an upload that fits within remaining quota', async () => {
    storageService.getUsage.mockResolvedValue({
      storageUsedBytes: 1000n,
      storageQuotaBytes: 2000n,
    });
    const ctx = createMockContext({ 'content-length': '500' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('allows an upload that exactly fills the remaining quota (boundary)', async () => {
    storageService.getUsage.mockResolvedValue({
      storageUsedBytes: 1000n,
      storageQuotaBytes: 2000n,
    });
    const ctx = createMockContext({ 'content-length': '1000' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects an upload that would exceed quota', async () => {
    storageService.getUsage.mockResolvedValue({
      storageUsedBytes: 1900n,
      storageQuotaBytes: 2000n,
    });
    const ctx = createMockContext({ 'content-length': '200' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('treats a missing content-length header as zero bytes', async () => {
    storageService.getUsage.mockResolvedValue({
      storageUsedBytes: 2000n,
      storageQuotaBytes: 2000n,
    });
    const ctx = createMockContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});

describe('StorageService', () => {
  let service: StorageService;
  let prisma: { user: { findUniqueOrThrow: jest.Mock; update: jest.Mock } };

  beforeEach(() => {
    prisma = {
      user: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new StorageService(prisma as unknown as PrismaService);
  });

  it('returns usage for a user', async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      storageUsedBytes: 500n,
      storageQuotaBytes: 2000n,
    });
    const result = await service.getUsage('user-1');
    expect(result).toEqual({
      storageUsedBytes: 500n,
      storageQuotaBytes: 2000n,
    });
  });

  it('increments storage used by the given amount', async () => {
    await service.incrementStorageUsed('user-1', 100n);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { storageUsedBytes: { increment: 100n } },
    });
  });

  it('decrements storage used by the given amount', async () => {
    await service.decrementStorageUsed('user-1', 100n);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { storageUsedBytes: { decrement: 100n } },
    });
  });
});
