import { vi, type Mocked } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ADMIN_PERMISSIONS, type AdminPermission } from '@sd/core-contracts';
import { AdminPermissionsRepository } from './admin-permissions.repo';
import { AdminPermissionsService } from './admin-permissions.service';

describe('AdminPermissionsService', () => {
  let service: AdminPermissionsService;
  let repo: Mocked<AdminPermissionsRepository>;

  const mockPermissionRecord = {
    userId: 'user1',
    permission: 'manage:scholars' as AdminPermission,
    grantedAt: new Date('2023-01-01'),
    grantedById: 'admin1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPermissionsService,
        {
          provide: AdminPermissionsRepository,
          useValue: {
            findByUserId: vi.fn(),
            findPermissionStringsByUserId: vi.fn(),
            grant: vi.fn().mockResolvedValue(mockPermissionRecord),
            revoke: vi.fn().mockResolvedValue(mockPermissionRecord),
            hasPermission: vi.fn(),
          } satisfies Partial<Mocked<AdminPermissionsRepository>>,
        },
      ],
    }).compile();

    service = module.get(AdminPermissionsService);
    repo = module.get(AdminPermissionsRepository) as Mocked<AdminPermissionsRepository>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('should return formatted permissions for user', async () => {
      repo.findByUserId.mockResolvedValue([mockPermissionRecord]);

      const result = await service.getPermissions('user1');

      expect(result).toEqual({
        permissions: [
          {
            userId: 'user1',
            permission: 'manage:scholars',
            grantedAt: '2023-01-01T00:00:00.000Z',
            grantedById: 'admin1',
          },
        ],
      });
      expect(repo.findByUserId).toHaveBeenCalledWith('user1');
    });

    it('should return empty array when user has no permissions', async () => {
      repo.findByUserId.mockResolvedValue([]);

      const result = await service.getPermissions('user1');

      expect(result).toEqual({ permissions: [] });
    });
  });

  describe('getMyPermissions', () => {
    it('should return permission strings for user', async () => {
      repo.findPermissionStringsByUserId.mockResolvedValue(['manage:scholars', 'manage:content']);

      const result = await service.getMyPermissions('user1');

      expect(result).toEqual({
        permissions: ['manage:scholars', 'manage:content'],
      });
      expect(repo.findPermissionStringsByUserId).toHaveBeenCalledWith('user1');
    });

    it('should return empty array when user has no permissions', async () => {
      repo.findPermissionStringsByUserId.mockResolvedValue([]);

      const result = await service.getMyPermissions('user1');

      expect(result).toEqual({ permissions: [] });
    });
  });

  describe('grant', () => {
    it('should grant valid permission and return updated permissions', async () => {
      const permission = 'manage:scholars';
      repo.findByUserId.mockResolvedValue([mockPermissionRecord]);

      const result = await service.grant('user1', permission, 'admin1');

      expect(result).toEqual({
        permissions: [
          {
            userId: 'user1',
            permission: 'manage:scholars',
            grantedAt: '2023-01-01T00:00:00.000Z',
            grantedById: 'admin1',
          },
        ],
      });
      expect(repo.grant).toHaveBeenCalledWith('user1', permission, 'admin1');
      expect(repo.findByUserId).toHaveBeenCalledWith('user1');
    });

    it('should throw NotFoundException for invalid permission', async () => {
      const invalidPermission = 'INVALID_PERMISSION';

      await expect(service.grant('user1', invalidPermission, 'admin1')).rejects.toThrow(
        new NotFoundException(`Unknown permission: ${invalidPermission}`),
      );

      expect(repo.grant).not.toHaveBeenCalled();
    });

    it('should handle all valid admin permissions', async () => {
      // Test that all permissions in ADMIN_PERMISSIONS are accepted
      for (const permission of ADMIN_PERMISSIONS) {
        repo.findByUserId.mockResolvedValue([]);

        await expect(service.grant('user1', permission, 'admin1')).resolves.toBeDefined();

        expect(repo.grant).toHaveBeenCalledWith('user1', permission, 'admin1');
      }
    });
  });

  describe('revoke', () => {
    it('should revoke permission when user has it', async () => {
      const permission = 'manage:scholars';
      repo.hasPermission.mockResolvedValue(true);
      repo.findByUserId.mockResolvedValue([]);

      const result = await service.revoke('user1', permission);

      expect(result).toEqual({ permissions: [] });
      expect(repo.hasPermission).toHaveBeenCalledWith('user1', permission);
      expect(repo.revoke).toHaveBeenCalledWith('user1', permission);
      expect(repo.findByUserId).toHaveBeenCalledWith('user1');
    });

    it('should throw NotFoundException for invalid permission', async () => {
      const invalidPermission = 'INVALID_PERMISSION';

      await expect(service.revoke('user1', invalidPermission)).rejects.toThrow(
        new NotFoundException(`Unknown permission: ${invalidPermission}`),
      );

      expect(repo.hasPermission).not.toHaveBeenCalled();
      expect(repo.revoke).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not have permission', async () => {
      const permission = 'manage:scholars';
      repo.hasPermission.mockResolvedValue(false);

      await expect(service.revoke('user1', permission)).rejects.toThrow(
        new NotFoundException(`User does not have permission: ${permission}`),
      );

      expect(repo.hasPermission).toHaveBeenCalledWith('user1', permission);
      expect(repo.revoke).not.toHaveBeenCalled();
    });
  });
});
