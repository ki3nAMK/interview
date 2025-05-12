import { UsersDomain } from '@/domains/user.domain';
import { RegisterRequest } from '@/dtos/requests/register.request';
import { IdResponse } from '@/dtos/responses/id.response';
import { User } from '@/models/user.schema';
import { UsersRepository } from '@/repositories/user.repo';
import { Injectable } from '@nestjs/common';
import { filter } from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    private readonly users_repository: UsersRepository,
    private readonly users_domain: UsersDomain,
  ) {}

  async getById(id: string): Promise<Partial<User> | null> {
    return await this.users_repository.findOneById(id);
  }

  async isTakenEmail(email: string): Promise<IdResponse> {
    return this.users_repository.isWithPropertyExists({ email });
  }

  async isTakenPhoneNumber(phoneNumber: string): Promise<IdResponse> {
    return this.users_repository.isWithPropertyExists({ phoneNumber });
  }

  async createUser(dto: RegisterRequest): Promise<{ id: string }> {
    return await this.users_domain.createUser(dto);
  }

  async getByUsername(username: string): Promise<User> {
    return this.users_domain.getUserByUsername(username);
  }

  async comparePassword(password: string, user: User): Promise<boolean> {
    return this.users_domain.comparePassword(password, user);
  }

  async findAllUsers(userId: string): Promise<{
    items: User[];
    count: number;
  }> {
    const { count, items } = await this.users_domain.findAll();

    return {
      items: filter(items, (item) => item?._id.toString() !== userId),
      count: count - 1,
    };
  }
}
