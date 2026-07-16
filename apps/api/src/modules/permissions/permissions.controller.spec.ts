import { vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import type { UserRoleAssignmentDto } from '@sd/core-contracts';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: Mocked<PermissionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            getRoles: vi.fn<any>(),
          } satisfies Partial<Mocked<PermissionsService>>,
        },
      ],
    }).compile();

    controller = module.get(PermissionsController);
    service = module.get(PermissionsService) as Mocked<PermissionsService>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should call permissionsService.getRoles with correct userId', async () => {
      const mockRolesResponse = {
        roles: [
          {
            id: 'r1',
            userId: 'u1',
            role: 'admin' as any,
            grantedAt: '2026-07-13T21:30:00.000Z',
            grantedBy: 'admin-1',
          } satisfies UserRoleAssignmentDto,
        ],
      };

      service.getRoles.mockResolvedValue(mockRolesResponse);

      const result = await controller.getRoles('u1');

      expect(service.getRoles).toHaveBeenCalledWith('u1');
      expect(result).toEqual(mockRolesResponse);
    });
  });
});
