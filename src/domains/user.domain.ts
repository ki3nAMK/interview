import { BaseDomainAbstract } from '@/base/abstract-domain.base';
import { RegisterRequest } from '@/dtos/requests/register.request';
import { User } from '@/models/user.schema';
import { UsersRepository } from '@/repositories/user.repo';
import { isValidEmail, isValidPhoneNumber } from '@/utils/helper';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { forEach } from 'lodash';
import { Types } from 'mongoose';

@Injectable()
export class UsersDomain extends BaseDomainAbstract<User> {
  constructor(private readonly user_repository: UsersRepository) {
    super(user_repository);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (isValidEmail(username)) {
      return await this.user_repository.getUser(
        {
          email: username,
        },
        true,
      );
    }

    if (isValidPhoneNumber(username)) {
      return await this.user_repository.getUser(
        {
          phoneNumber: username,
        },
        true,
      );
    }

    return null;
  }

  async createUser(dto: RegisterRequest): Promise<{ id: string }> {
    const { _id } = await this.user_repository.create({
      ...dto,
    });

  return { id: _id.toString() };
  }

  async comparePassword(password: string, user: User): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async checkIfUsersExist(userIds: string[]) {
    forEach(userIds, (userId) => {
      if (!Types.ObjectId.isValid(userId)) {
        throw new NotFoundException('User not found');
      }
    });

    const { items: users } = await this.user_repository.findAll({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new NotFoundException('User not found');
    }
  }
}
