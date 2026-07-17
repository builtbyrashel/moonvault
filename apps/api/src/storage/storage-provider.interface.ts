export interface UploadResult {
  key: string;
  sizeBytes: number;
}

export interface StorageProvider {
  upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult>;
  getReadStreamUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
