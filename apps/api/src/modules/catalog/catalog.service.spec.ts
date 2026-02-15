import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repo';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';

describe('CatalogService', () => {
  let service: CatalogService;
  let repo: jest.Mocked<CatalogRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: CatalogRepository,
          useValue: {
            listCollections: jest.fn(),
            listRootSeries: jest.fn(),
            listRootLectures: jest.fn(),
          } satisfies Partial<jest.Mocked<CatalogRepository>>,
        },
      ],
    }).compile();

    service = module.get(CatalogService);
    repo = module.get(CatalogRepository) as jest.Mocked<CatalogRepository>;
  });

  it('delegates listCollections', async () => {
    const query = new CatalogListQueryDto();

    repo.listCollections.mockResolvedValue({
      items: [],
      nextCursor: undefined,
    });

    await expect(service.listCollections(query)).resolves.toEqual({
      items: [],
      nextCursor: undefined,
    });

    expect(repo.listCollections).toHaveBeenCalledWith(query);
  });

  it('delegates listRootSeries', async () => {
    const query = new CatalogListQueryDto();

    repo.listRootSeries.mockResolvedValue({
      items: [],
      nextCursor: undefined,
    });

    await expect(service.listRootSeries(query)).resolves.toEqual({
      items: [],
      nextCursor: undefined,
    });

    expect(repo.listRootSeries).toHaveBeenCalledWith(query);
  });

  it('delegates listRootLectures', async () => {
    const query = new CatalogListQueryDto();

    repo.listRootLectures.mockResolvedValue({
      items: [],
      nextCursor: undefined,
    });

    await expect(service.listRootLectures(query)).resolves.toEqual({
      items: [],
      nextCursor: undefined,
    });

    expect(repo.listRootLectures).toHaveBeenCalledWith(query);
  });
});
