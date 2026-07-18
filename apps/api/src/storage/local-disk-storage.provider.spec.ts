import * as fs from 'fs/promises';
import * as path from 'path';
import { LocalDiskStorageProvider } from './local-disk-storage.provider';

describe('LocalDiskStorageProvider', () => {
  let provider: LocalDiskStorageProvider;
  let testBasePath: string;

  beforeEach(() => {
    testBasePath = path.join(process.cwd(), 'storage-data-test');
    process.env.LOCAL_STORAGE_PATH = testBasePath;
    provider = new LocalDiskStorageProvider();
  });

  afterEach(async () => {
    await fs.rm(testBasePath, { recursive: true, force: true });
    delete process.env.LOCAL_STORAGE_PATH;
  });

  it('writes a buffer to disk and returns the key and size', async () => {
    const buffer = Buffer.from('hello moonvault');
    const result = await provider.upload(buffer, 'users/u1/test.txt');
    expect(result.key).toBe('users/u1/test.txt');
    expect(result.sizeBytes).toBe(buffer.length);

    const written = await fs.readFile(
      path.join(testBasePath, 'users/u1/test.txt'),
    );
    expect(written.toString()).toBe('hello moonvault');
  });

  it('creates nested directories as needed', async () => {
    await provider.upload(Buffer.from('nested'), 'a/b/c/nested.txt');
    const exists = await fs
      .access(path.join(testBasePath, 'a/b/c/nested.txt'))
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it('returns a local read URL referencing the key', async () => {
    const url = await provider.getReadStreamUrl('users/u1/test.txt');
    expect(url).toBe('/local-storage/users/u1/test.txt');
  });

  it('deletes a file that exists', async () => {
    await provider.upload(
      Buffer.from('to be deleted'),
      'users/u1/delete-me.txt',
    );
    await provider.delete('users/u1/delete-me.txt');
    const exists = await fs
      .access(path.join(testBasePath, 'users/u1/delete-me.txt'))
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('does not throw when deleting a file that does not exist', async () => {
    await expect(provider.delete('nonexistent.txt')).resolves.not.toThrow();
  });
});
