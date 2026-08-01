import { vi } from 'bun:test';

export const mockList = vi.fn<() => void>();
export const mockPresign = vi.fn<() => void>();
export const mockFile = vi
  .fn<(_key: string) => { presign: any }>()
  .mockImplementation((_key: string) => ({
    presign: mockPresign,
  }));

export class S3Client {
  list = mockList;
  file = mockFile;
}
