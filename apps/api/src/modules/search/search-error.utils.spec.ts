import { Prisma } from '@sd/db';
import { isTrigramSearchFailure } from './search-error.utils';

describe('isTrigramSearchFailure', () => {
  it('matches missing similarity function errors', () => {
    const error = new Error('function similarity(text, text) does not exist');

    expect(isTrigramSearchFailure(error)).toBe(true);
  });

  it('matches missing trigram operator errors', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Raw query failed. Code: `42883`. Message: `operator does not exist: text % text`',
      {
        clientVersion: 'test',
        code: 'P2010',
      },
    );

    expect(isTrigramSearchFailure(error)).toBe(true);
  });

  it('ignores unrelated database errors', () => {
    const error = new Error('column "publishedLectureCount" does not exist');

    expect(isTrigramSearchFailure(error)).toBe(false);
  });
});
