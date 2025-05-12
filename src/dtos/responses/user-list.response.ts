import { User } from '@/models/user.schema';

export class UserListResponse {
  items: User[];
  total: number;
}
