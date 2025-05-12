import { ApiProperty } from '@nestjs/swagger';

export class OkResponse {
  @ApiProperty({ example: true })
  success: boolean;
}
