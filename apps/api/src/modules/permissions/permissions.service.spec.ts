import { vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import type { UserRole } from '@sd/core-contracts';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repo: Mocked<PermissionsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionsRepository,
          useValue: {
            getUserRolesDetail: vi.fn<any>(),
          } satisfies Partial<Mocked<PermissionsRepository>>,
        },
      ],
    }).compile();

    service = module.get(PermissionsService);
    repo = module.get(PermissionsRepository) as Mocked<PermissionsRepository>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should fetch user roles from repo and map them correctly', async () => {
      const now = new Date();
      const mockRoles = [
        {
          id: 'r1',
          userId: 'u1',
          role: 'admin' as UserRole,
          grantedAt: now,
          grantedBy: 'admin-1',
        },
      ];

      repo.getUserRolesDetail.mockResolvedValue(mockRoles as any);

      const result = await service.getRoles('u1');

      expect(repo.getUserRolesDetail).toHaveBeenCalledWith('u1');
      expect(result).toEqual({
        roles: [
          {
            id: 'r1',
            userId: 'u1',
            role: 'admin',
            grantedAt: now.toISOString(),
            grantedBy: 'admin-1',
          },
        ],
      });
    });
  });
});
