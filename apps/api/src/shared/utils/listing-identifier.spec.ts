import { describe, it, expect } from 'bun:test';
import { isListingUuid } from './listing-identifier';

describe('isListingUuid', () => {
  it('recognizes a v4 UUID', () => {
    expect(isListingUuid('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isListingUuid('3FA85F64-5717-4562-B3FC-2C963F66AFA6')).toBe(true);
  });

  it('rejects a slug', () => {
    expect(isListingUuid('tafsir-al-fatiha')).toBe(false);
  });

  it('rejects a malformed uuid-like string', () => {
    expect(isListingUuid('3fa85f64-5717-4562-b3fc-2c963f66afa')).toBe(false);
  });
});
