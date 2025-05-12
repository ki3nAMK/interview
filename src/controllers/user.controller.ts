import { CurrentUser } from '@/decorators/current-user.decorator';
import { SessionType } from '@/enums/session-type.enum';
import { JwtAccessTokenGuard } from '@/guards/jwt-access-token.guard';
import { User } from '@/models/user.schema';
import { UsersService } from '@/services/user.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth(SessionType.ACCESS)
@ApiTags('Users')
@UseGuards(JwtAccessTokenGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @ApiOkResponse({ type: () => User })
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  async getMe(@CurrentUser() userId: string) {
    const result = await this.userService.getById(userId);
    return result;
  }
}
