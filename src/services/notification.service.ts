import { notificationsDomain } from '@/domains/notification.domain';
import { NotificationsRepository } from '@/repositories/notification.repo';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationsRepository,
    private readonly notificationDomain: notificationsDomain,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendMessageWhenNewGroupCreated(
    userId: string,
    memberIds: string[],
  ): Promise<void> {
    const { message } =
      await this.notificationDomain.handleNotificationWhenNewGroupCreated(
        userId,
        memberIds,
      );

    this.eventEmitter.emit('notification.new-group', {
      userId,
      memberIds,
      message,
    });
  }

  async getAllNotifications(userId: string): Promise<any> {
    return await this.notificationRepository.getAllNotifications(userId);
  }
}
