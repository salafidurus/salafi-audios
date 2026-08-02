import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import type { PermissionsRepository } from './permissions.repository';

function mockRepository(): PermissionsRepository {
  return {
    findScholarBySlug: vi.fn<any>(),
    findScholarLink: vi.fn<any>(),
    createScholarLink: vi.fn<any>(),
    deleteScholarLink: vi.fn<any>(),
    createUserPermission: vi.fn<any>(),
    findUserPermission: vi.fn<any>(),
    findTranslatorRoleByScope: vi.fn<any>(),
    getTranslatorRolesByScope: vi.fn<any>(),
    createTranslatorRole: vi.fn<any>(),
    deleteTranslatorRole: vi.fn<any>(),
    updateTranslatorPublishPermission: vi.fn<any>(),
    getScholarsByUser: vi.fn<any>(),
    getTranslatorLanguages: vi.fn<any>(),
  } as unknown as PermissionsRepository;
}

describe('PermissionsService — scholar/translator scoped grants', () => {
  let repository: PermissionsRepository;
  let service: PermissionsService;

  beforeEach(() => {
    repository = mockRepository();
    service = new PermissionsService(repository);
  });

  describe('linkUserToScholar', () => {
    it('resolves scholarSlug to an id and creates the link', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue({ id: 'scholar-1' });
      (repository.findScholarLink as any).mockResolvedValue(null);

      await service.linkUserToScholar('user-1', 'ibn-taymiyyah', 'OWN_CONTENT', 'admin-1');

      expect(repository.findScholarLink).toHaveBeenCalledWith('user-1', 'scholar-1', 'OWN_CONTENT');
      expect(repository.createScholarLink).toHaveBeenCalledWith(
        'user-1',
        'scholar-1',
        'OWN_CONTENT',
        'admin-1',
      );
    });

    it('throws when the scholar slug does not resolve to a scholar', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue(null);

      await expect(
        service.linkUserToScholar('user-1', 'no-such-slug', 'OWN_CONTENT', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.createScholarLink).not.toHaveBeenCalled();
    });

    it('throws when the link already exists', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue({ id: 'scholar-1' });
      (repository.findScholarLink as any).mockResolvedValue({ id: 'link-1' });

      await expect(
        service.linkUserToScholar('user-1', 'ibn-taymiyyah', 'OWN_CONTENT', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.createScholarLink).not.toHaveBeenCalled();
    });

    it('does not grant any global permission as a side effect (D3 regression guard)', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue({ id: 'scholar-1' });
      (repository.findScholarLink as any).mockResolvedValue(null);

      await service.linkUserToScholar('user-1', 'ibn-taymiyyah', 'OWN_CONTENT', 'admin-1');

      expect(repository.createUserPermission).not.toHaveBeenCalled();
    });
  });

  describe('grantTranslatorLanguage', () => {
    it('resolves a non-null scholarSlug and scopes the created row to it', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue({ id: 'scholar-1' });
      (repository.findTranslatorRoleByScope as any).mockResolvedValue(null);

      await service.grantTranslatorLanguage('user-1', 'ibn-taymiyyah', 'ar', true, 'admin-1');

      expect(repository.findTranslatorRoleByScope).toHaveBeenCalledWith(
        'user-1',
        'scholar-1',
        'ar',
      );
      expect(repository.createTranslatorRole).toHaveBeenCalledWith(
        'user-1',
        'scholar-1',
        'ar',
        true,
        'admin-1',
      );
    });

    it('passes scholarId null through unchanged when scholarSlug is null (all scholars)', async () => {
      (repository.findTranslatorRoleByScope as any).mockResolvedValue(null);

      await service.grantTranslatorLanguage('user-1', null, 'ar', false, 'admin-1');

      expect(repository.findScholarBySlug).not.toHaveBeenCalled();
      expect(repository.createTranslatorRole).toHaveBeenCalledWith(
        'user-1',
        null,
        'ar',
        false,
        'admin-1',
      );
    });

    it('does not grant any global permission as a side effect (D3 regression guard)', async () => {
      (repository.findTranslatorRoleByScope as any).mockResolvedValue(null);

      await service.grantTranslatorLanguage('user-1', null, 'ar', true, 'admin-1');

      expect(repository.createUserPermission).not.toHaveBeenCalled();
    });

    it('throws when a translator role already exists for that scope+locale', async () => {
      (repository.findTranslatorRoleByScope as any).mockResolvedValue({ id: 'role-1' });

      await expect(
        service.grantTranslatorLanguage('user-1', null, 'ar', false, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.createTranslatorRole).not.toHaveBeenCalled();
    });
  });

  describe('syncTranslatorLocales', () => {
    it('creates missing locales, deletes dropped locales, and updates canPublish on changed rows', async () => {
      (repository.getTranslatorRolesByScope as any).mockResolvedValue([
        { id: 'role-en', locale: 'en', canPublish: false },
        { id: 'role-ar', locale: 'ar', canPublish: true },
      ]);

      // Requested set: keep 'ar' (canPublish now false, so it updates), drop
      // 'en', add 'fr'.
      await service.syncTranslatorLocales('user-1', null, ['ar', 'fr'] as any, false, 'admin-1');

      expect(repository.createTranslatorRole).toHaveBeenCalledWith(
        'user-1',
        null,
        'fr',
        false,
        'admin-1',
      );
      expect(repository.deleteTranslatorRole).toHaveBeenCalledWith('role-en');
      expect(repository.updateTranslatorPublishPermission).toHaveBeenCalledWith('role-ar', false);
    });

    it('is a no-op when the requested set already matches with the same canPublish value', async () => {
      (repository.getTranslatorRolesByScope as any).mockResolvedValue([
        { id: 'role-ar', locale: 'ar', canPublish: true },
      ]);

      await service.syncTranslatorLocales('user-1', null, ['ar'] as any, true, 'admin-1');

      expect(repository.createTranslatorRole).not.toHaveBeenCalled();
      expect(repository.deleteTranslatorRole).not.toHaveBeenCalled();
      expect(repository.updateTranslatorPublishPermission).not.toHaveBeenCalled();
    });

    it('resolves scholarSlug once and scopes every created row to it', async () => {
      (repository.findScholarBySlug as any).mockResolvedValue({ id: 'scholar-1' });
      (repository.getTranslatorRolesByScope as any).mockResolvedValue([]);

      await service.syncTranslatorLocales(
        'user-1',
        'ibn-taymiyyah',
        ['en', 'ar'] as any,
        true,
        'admin-1',
      );

      expect(repository.getTranslatorRolesByScope).toHaveBeenCalledWith('user-1', 'scholar-1');
      expect(repository.createTranslatorRole).toHaveBeenCalledWith(
        'user-1',
        'scholar-1',
        'en',
        true,
        'admin-1',
      );
      expect(repository.createTranslatorRole).toHaveBeenCalledWith(
        'user-1',
        'scholar-1',
        'ar',
        true,
        'admin-1',
      );
    });
  });

  describe('listScholarRoles / listTranslatorRoles', () => {
    it('maps scholar role rows to DTOs with resolved scholarSlug/scholarName', async () => {
      (repository.getScholarsByUser as any).mockResolvedValue([
        {
          id: 'link-1',
          userId: 'user-1',
          scholarId: 'scholar-1',
          permissionType: 'OWN_CONTENT',
          createdAt: new Date('2026-01-01T00:00:00Z'),
          createdBy: 'admin-1',
          scholar: { slug: 'ibn-taymiyyah', name: 'Ibn Taymiyyah' },
        },
      ]);

      const result = await service.listScholarRoles('user-1');

      expect(result).toEqual([
        {
          id: 'link-1',
          userId: 'user-1',
          scholarId: 'scholar-1',
          scholarSlug: 'ibn-taymiyyah',
          scholarName: 'Ibn Taymiyyah',
          permissionType: 'OWN_CONTENT',
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy: 'admin-1',
        },
      ]);
    });

    it('maps translator role rows with scholarSlug/scholarName null for all-scholars grants', async () => {
      (repository.getTranslatorLanguages as any).mockResolvedValue([
        {
          id: 'role-1',
          userId: 'user-1',
          scholarId: null,
          locale: 'ar',
          canPublish: true,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          createdBy: 'admin-1',
          scholar: null,
        },
      ]);

      const result = await service.listTranslatorRoles('user-1');

      expect(result).toEqual([
        {
          id: 'role-1',
          userId: 'user-1',
          scholarId: null,
          scholarSlug: null,
          scholarName: null,
          locale: 'ar',
          canPublish: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy: 'admin-1',
        },
      ]);
    });
  });
});
