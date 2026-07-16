import { vi, type Mock } from 'vitest';

export const mockList: Mock = vi.fn<() => void>();
export const mockPresign: Mock = vi.fn<() => void>();
export const mockFile: Mock = vi
  .fn<(_key: string) => { presign: Mock }>()
  .mockImplementation((_key: string) => ({
    presign: mockPresign,
  }));

export class S3Client {
  list: Mock = mockList;
  file: Mock = mockFile;
}
