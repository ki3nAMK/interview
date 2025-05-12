import { Session } from '@/models/session.schema';
import { User } from '@/models/user.schema';
import { Request } from 'express';

export interface AppRequest extends Request {
  currentSessionId: string;
  currentUserId: string;
  skipVerification: boolean;
  token?: string;
}
