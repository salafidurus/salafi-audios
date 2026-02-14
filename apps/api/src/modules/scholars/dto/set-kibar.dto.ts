import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetKibarDto {
  @ApiProperty({
    description: 'Whether the scholar is marked as Kibar ul-Ulama',
  })
  @IsBoolean()
  isKibar!: boolean;
}
