import { BaseDomainAbstract } from '@/base/abstract-domain.base';
import { TokenResponse } from '@/dtos/responses/token.response';
import { Session } from '@/models/session.schema';
import { SessionsRepository } from '@/repositories/session.repo';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { CacheDomain } from './cache.domain';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from '@/keys/jwt.keys';
import { addDays, isAfter } from 'date-fns';
import { currentTime } from '@/utils/helper';
import { JwtService } from '@nestjs/jwt';
import { RedisKey } from '@/enums/redis-key.enum';
import { DeleteSessionRequest } from '@/dtos/requests/delete-session.request';
import { SessionType } from '@/enums/session-type.enum';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { TokenPayload } from '@/dtos/requests/token-payload';

@Injectable()
export class SessionsDomain extends BaseDomainAbstract<Session> {
  logger = new Logger(SessionsDomain.name);

  constructor(
    private readonly session_repository: SessionsRepository,
    private readonly cacheDomain: CacheDomain,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super(session_repository);
  }

  async genSession(userId: string): Promise<TokenResponse> {
    const sessionId = new Types.ObjectId().toString();

    const payload = { id: sessionId };

    const accessTokenExpiresIn = this.configService.get<number>(
      'jwt.accessTokenExpiresIn',
    );

    const refreshTokenExpiresIn = this.configService.get<number>(
      'jwt.refreshTokenExpiresIn',
    );

    const accessToken = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: ACCESS_TOKEN_PRIVATE_KEY,
      expiresIn: `${accessTokenExpiresIn}d`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: REFRESH_TOKEN_PRIVATE_KEY,
      expiresIn: `${refreshTokenExpiresIn}d`,
    });

    const refreshExpiresAt = addDays(currentTime(), accessTokenExpiresIn);
    const accessExpiresAt = addDays(currentTime(), refreshTokenExpiresIn);

    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : null;
    if (!userObjectId) {
      this.logger.error(`Invalid userId format: ${userId}`);
      throw new BadRequestException('Invalid userId format');
    }

    const promises = [
      this.create({
        _id: new Types.ObjectId(sessionId),
        expiresAt: accessExpiresAt,
        user: userObjectId,
      }),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${RedisKey.ACCESS_SESSIONS}:sessionId-${sessionId}`,
          userId,
          accessTokenExpiresIn * 24 * 60 * 60 * 1000,
        ),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${RedisKey.REFRESH_SESSIONS}:sessionId-${sessionId}`,
          userId,
          refreshTokenExpiresIn * 24 * 60 * 60 * 1000,
        ),
      this.cacheDomain
        .getRedisClient()
        .sadd(`${RedisKey.SESSIONS}:userId-${userId}`, sessionId),
    ];

    await Promise.all(promises);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async deleteSession({
    userId,
    sessionId,
    accessToken,
    refreshToken,
  }: DeleteSessionRequest) {
    const promises = [
      this.cacheDomain
        .getCacheManager()
        .del(`${RedisKey.ACCESS_SESSIONS}:sessionId-${sessionId}`),
      this.cacheDomain
        .getCacheManager()
        .del(`${RedisKey.REFRESH_SESSIONS}:sessionId-${sessionId}`),
      this.cacheDomain
        .getRedisClient()
        .srem(`${RedisKey.SESSIONS}:userId-${userId}`, sessionId),
      this.cacheDomain
        .getRedisClient()
        .sadd(RedisKey.BLACK_LIST_SESSIONS, sessionId),
      this.session_repository.softDelete(sessionId),
    ];

    if (accessToken) {
      promises.push(
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_ACCESS_TOKENS, accessToken),
      );
    }

    if (refreshToken) {
      promises.push(
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_REFRESH_TOKENS, refreshToken),
      );
    }

    await Promise.all(promises);
  }

  async verifySession(sessionId: string, type: SessionType) {
    const isBlackList = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.BLACK_LIST_SESSIONS, sessionId);

    if (isBlackList) {
      throw new UnauthorizedException({
        code: ErrorDictionary.UNAUTHORIZED,
      });
    }

    const sessionKeyPrefix =
      type === SessionType.ACCESS
        ? RedisKey.ACCESS_SESSIONS
        : RedisKey.REFRESH_SESSIONS;

    const userId = await this.cacheDomain
      .getCacheManager()
      .get<string>(`${sessionKeyPrefix}:sessionId-${sessionId}`);

    if (!userId) {
      const session = await this.session_repository.findOneByCondition(
        {
          _id: new Types.ObjectId(sessionId),
        },
        'user',
      );

      if (!session) {
        await this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_SESSIONS, sessionId);
        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      if (this.isExpired(session)) {
        await Promise.all([
          this.session_repository.softDelete(sessionId),
          this.cacheDomain
            .getRedisClient()
            .sadd(RedisKey.BLACK_LIST_SESSIONS, sessionId),
          this.cacheDomain
            .getCacheManager()
            .del(`${sessionKeyPrefix}:sessionId-${sessionId}`),
        ]);

        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      await this.cacheDomain
        .getCacheManager()
        .set(
          `${sessionKeyPrefix}:sessionId-${sessionId}`,
          session.user._id.toString(),
          session.expiresAt.getTime() - Date.now(),
        );

      return {
        sessionId: session._id.toString(),
        userId: session.user._id.toString(),
      };
    }

    return { sessionId, userId };
  }

  async verifyToken(token: string, type: SessionType) {
    const blackListKey =
      type === SessionType.ACCESS
        ? RedisKey.BLACK_LIST_ACCESS_TOKENS
        : RedisKey.BLACK_LIST_REFRESH_TOKENS;

    try {
      const publicKey =
        type === SessionType.ACCESS
          ? ACCESS_TOKEN_PUBLIC_KEY
          : REFRESH_TOKEN_PUBLIC_KEY;

      const existingBlackList = await this.cacheDomain
        .getRedisClient()
        .sismember(blackListKey, token);

      if (existingBlackList) {
        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      const { id }: TokenPayload = await this.jwtService.verifyAsync(token, {
        publicKey,
        ignoreExpiration: false,
      });

      const result = await this.verifySession(id, type);
      return result;
    } catch (error) {
      await this.cacheDomain.getRedisClient().sadd(blackListKey, token);
      throw new UnauthorizedException({
        code: ErrorDictionary.UNAUTHORIZED,
      });
    }
  }

  isExpired(session: Session): boolean {
    return isAfter(currentTime(), session.expiresAt);
  }
}
