import { AppRequest } from '@/dtos/requests/app.request';
import { TokenPayload } from '@/dtos/requests/token-payload';
import { SessionType } from '@/enums/session-type.enum';
import { REFRESH_TOKEN_PUBLIC_KEY } from '@/keys/jwt.keys';
import { SessionsService } from '@/services/session.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly sessionsService: SessionsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: REFRESH_TOKEN_PUBLIC_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req: AppRequest, { id }: TokenPayload) {
    const { sessionId, userId } = await this.sessionsService.verifySession(
      id,
      SessionType.REFRESH,
    );

    req.currentUserId = userId;
    req.currentSessionId = sessionId;

    return true;
  }
}
