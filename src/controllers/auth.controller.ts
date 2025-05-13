import { CurrentSession } from '@/decorators/current-session.decorator';
import { CurrentToken } from '@/decorators/current-token.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { LoginRequest } from '@/dtos/requests/login.request';
import { RegisterRequest } from '@/dtos/requests/register.request';
import { LoginResponse } from '@/dtos/responses/login.response';
import { OkResponse } from '@/dtos/responses/ok.response';
import { RegisterResponse } from '@/dtos/responses/register.response';
import { SessionType } from '@/enums/session-type.enum';
import { JwtAccessTokenGuard } from '@/guards/jwt-access-token.guard';
import { AuthService } from '@/services/auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: () => RegisterResponse })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login system', description: 'Login' })
  @Post('/sign-up')
  async register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    const result = await this.authService.register(dto);
    return result;
  }

  @ApiOkResponse({ type: () => LoginResponse })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register system', description: 'Register' })
  @Post('/sign-in')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    const result = await this.authService.login(body);
    return result;
  }

  @ApiBearerAuth(SessionType.ACCESS)
  @ApiOkResponse({ type: () => OkResponse })
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout system', description: 'Logout' })
  @Post('/sign-out')
  async logout(
    @CurrentUser() userId: string,
    @CurrentSession() sessionId: string,
    @CurrentToken() token: string,
  ): Promise<OkResponse> {
    const result = await this.authService.logout(userId, sessionId, token);
    return result;
  }
}
