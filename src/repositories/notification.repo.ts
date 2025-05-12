import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { Notification } from '@/models/notification.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsRepository extends BaseRepositoryAbstract<Notification> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notification_repository: Model<Notification>,
  ) {
    super(notification_repository);
  }

  async getAllNotifications(userId: string): Promise<Notification[]> {
    return await this.notification_repository
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
