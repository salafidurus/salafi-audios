import { vi } from 'vitest';

export const mockList = vi.fn();
export const mockPresign = vi.fn();
export const mockFile = vi.fn().mockImplementation((key: string) => ({
  presign: mockPresign,
}));

export class S3Client {
  list = mockList;
  file = mockFile;
}
