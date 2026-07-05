import { Prisma } from '@sd/core-db';
import { isLegacyTopicSchemaFailure } from './topics-error.utils';

describe('isLegacyTopicSchemaFailure', () => {
  it('matches prisma missing column errors', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'The column `createdAt` does not exist in the current database.',
      {
        clientVersion: 'test',
        code: 'P2022',
      },
    );

    expect(isLegacyTopicSchemaFailure(error)).toBe(true);
  });

  it('matches raw postgres missing parentId errors', () => {
    const error = new Error('column "parentId" does not exist');

    expect(isLegacyTopicSchemaFailure(error)).toBe(true);
  });

  it('ignores unrelated errors', () => {
    const error = new Error('relation "Topic" does not exist');

    expect(isLegacyTopicSchemaFailure(error)).toBe(false);
  });
});
