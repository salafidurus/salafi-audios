import { vi, type Mock } from 'vitest';

export const mockList: Mock = vi.fn<any>();
export const mockPresign: Mock = vi.fn<any>();
export const mockFile: Mock = vi.fn<any>().mockImplementation((_key: string) => ({
  presign: mockPresign,
}));

export class S3Client {
  list: Mock = mockList;
  file: Mock = mockFile;
}
