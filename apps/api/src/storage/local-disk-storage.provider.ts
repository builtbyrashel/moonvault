import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { StorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor() {
    this.basePath =
      process.env.LOCAL_STORAGE_PATH ??
      path.join(process.cwd(), 'storage-data');
  }

  async upload(buffer: Buffer, key: string): Promise<UploadResult> {
    const filePath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return { key, sizeBytes: buffer.length };
  }

  getReadStreamUrl(key: string): Promise<string> {
    // Local dev only: served via a static route we'll add to main.ts,
    // not a signed cloud URL. This will be replaced entirely by a real
    // signed URL once a cloud StorageProvider exists.
    return Promise.resolve(`/local-storage/${key}`);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    await fs.rm(filePath, { force: true });
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, key);
    return fs.readFile(filePath);
  }
}
