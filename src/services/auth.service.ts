import { LoginRequest } from '@/dtos/requests/login.request';
import { RegisterRequest } from '@/dtos/requests/register.request';
import { LoginResponse } from '@/dtos/responses/login.response';
import { RegisterResponse } from '@/dtos/responses/register.response';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { OK_RESPONSE } from '@/utils/constants';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isEmpty } from 'lodash';
import { SessionsService } from './session.service';
import { UsersService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterRequest): Promise<RegisterResponse> {
    const { email, phoneNumber } = dto;

    const isTakenEmail = await this.usersService.isTakenEmail(email);
    if (isTakenEmail) {
      throw new ConflictException({
        code: ErrorDictionary.EMAIL_ALREADY_TAKEN,
      });
    }

    const isTakenPhoneNumber =
      await this.usersService.isTakenPhoneNumber(phoneNumber);
    if (isTakenPhoneNumber) {
      throw new ConflictException({
        code: ErrorDictionary.PHONE_NUMBER_ALREADY_TAKEN,
      });
    }

    const { id: userId } = await this.usersService.createUser(dto);

    const { accessExpiresAt, accessToken, refreshExpiresAt, refreshToken } =
      await this.sessionService.gen(userId);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const user = await this.usersService.getByUsername(username);

    if (isEmpty(user)) {
      throw new UnauthorizedException({
        code: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      });
    }

    const isPasswordCorrect = await this.usersService.comparePassword(
      password,
      user,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException({
        code: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      });
    }

    const result = await this.sessionService.gen(user._id.toString());

    return result;
  }

  async logout(userId: string, sessionId: string, token: string) {
    await this.sessionService.delete({ sessionId, userId, accessToken: token });
    return OK_RESPONSE;
  }
}
