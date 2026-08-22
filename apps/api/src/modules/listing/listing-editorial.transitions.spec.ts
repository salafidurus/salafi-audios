import { describe, expect, it } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { assertListingTransition } from './listing-editorial.transitions';

describe('Listing editorial transitions', () => {
  it('allows publishing draft and review listings', () => {
    expect(() => assertListingTransition('publish', 'draft')).not.toThrow();
    expect(() => assertListingTransition('publish', 'review')).not.toThrow();
  });

  it('allows archiving only published listings', () => {
    expect(() => assertListingTransition('archive', 'published')).not.toThrow();
    expect(() => assertListingTransition('archive', 'draft')).toThrow(BadRequestException);
    expect(() => assertListingTransition('archive', 'review')).toThrow(BadRequestException);
  });

  it('rejects repeated publication and archive transitions', () => {
    expect(() => assertListingTransition('publish', 'published')).toThrow(BadRequestException);
    expect(() => assertListingTransition('archive', 'archived')).toThrow(BadRequestException);
  });
});
