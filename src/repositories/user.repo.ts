import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { IdResponse } from '@/dtos/responses/id.response';
import { User } from '@/models/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';

@Injectable()
export class UsersRepository extends BaseRepositoryAbstract<User> {
  constructor(
    @InjectModel(User.name)
    private readonly users_repository: Model<User>,
  ) {
    super(users_repository);
  }

  async isWithPropertyExists(
    condition: RootFilterQuery<User>,
  ): Promise<IdResponse> {
    const user = await this.users_repository.exists({
      ...condition,
      deleted_at: null,
    });
    return user;
  }

  async getUser(
    condition: RootFilterQuery<User>,
    includePassword = false,
  ): Promise<User> {
    const user = await this.users_repository
      .findOne({
        ...condition,
        deleted_at: null,
      })
      .select(includePassword ? '+password' : '-password')
      .exec();
    return user;
  }
}
