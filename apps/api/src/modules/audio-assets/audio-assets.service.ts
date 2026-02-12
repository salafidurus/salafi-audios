import { Injectable, NotFoundException } from '@nestjs/common';
import { AudioAssetsRepository } from './audio-assets.repo';
import { AudioAssetViewDto } from './dto/audio-asset-view.dto';
import { UpsertAudioAssetDto } from './dto/upsert-audio-asset.dto';

@Injectable()
export class AudioAssetsService {
  constructor(private readonly repo: AudioAssetsRepository) {}

  async listByLectureId(lectureId: string): Promise<AudioAssetViewDto[]> {
    const result = await this.repo.listByLectureId(lectureId);
    if (!result)
      throw new NotFoundException(`Lecture "${lectureId}" not found`);
    return result;
  }

  async getById(id: string): Promise<AudioAssetViewDto> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException(`AudioAsset "${id}" not found`);
    return found;
  }

  async upsertByLecture(
    lectureId: string,
    dto: UpsertAudioAssetDto,
  ): Promise<AudioAssetViewDto> {
    const result = await this.repo.upsertByLectureIdAndUrl(lectureId, dto);
    if (!result)
      throw new NotFoundException(`Lecture "${lectureId}" not found`);
    return result;
  }
}
