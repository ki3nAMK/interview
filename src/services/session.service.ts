import { SessionsDomain } from '@/domains/session.domain';
import { DeleteSessionRequest } from '@/dtos/requests/delete-session.request';
import { TokenResponse } from '@/dtos/responses/token.response';
import { VerifySessionResponse } from '@/dtos/responses/verify-session.response';
import { SessionType } from '@/enums/session-type.enum';
import { SessionsRepository } from '@/repositories/session.repo';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SessionsService {
  logger = new Logger(SessionsService.name);

  constructor(
    private readonly session_repository: SessionsRepository,
    private readonly session_domain: SessionsDomain,
  ) {}

  async gen(userId: string): Promise<TokenResponse> {
    return await this.session_domain.genSession(userId);
  }

  async delete(payload: DeleteSessionRequest): Promise<void> {
    await this.session_domain.deleteSession(payload);
  }

  async verifyToken(
    token: string,
    type: SessionType,
  ): Promise<VerifySessionResponse> {
    return await this.session_domain.verifyToken(token, type);
  }

  async verifySession(
    sessionId: string,
    type: SessionType,
  ): Promise<VerifySessionResponse> {
    return await this.session_domain.verifySession(sessionId, type);
  }
}
