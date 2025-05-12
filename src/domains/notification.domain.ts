import { NotificationsRepository } from '@/repositories/notification.repo';
import { UsersService } from '@/services/user.service';
import { Injectable } from '@nestjs/common';
import { map } from 'lodash';
import { Types } from 'mongoose';

@Injectable()
export class notificationsDomain {
  constructor(
    private readonly notificationRepository: NotificationsRepository,
    private readonly userService: UsersService,
  ) {}

  async handleNotificationWhenNewGroupCreated(
    userId: string,
    memberIds: string[],
  ): Promise<{ message: string }> {
    const user = await this.userService.getById(userId);
    let message = `New group created by user with email: ${user.email}`;

    const promises = map(memberIds, async (memberId) => {
      return this.notificationRepository.create({
        user: new Types.ObjectId(memberId),
        message: `New group created by user with email: ${user.email}`,
      });
    });

    await Promise.all([
      ...promises,
      this.notificationRepository.create({
        user: new Types.ObjectId(userId),
        message: `You created a new group with members: ${memberIds.join(', ')}`,
      }),
    ]);

    return {
      message,
    };
  }
}
