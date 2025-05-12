import { BaseDomainAbstract } from '@/base/abstract-domain.base';
import { CreateEntityResponse } from '@/dtos/responses/create-entity.response';
import { MessageType } from '@/enums/message-type.enum';
import { Message } from '@/models/message.schema';
import { MessagesRepository } from '@/repositories/message.repo';
import { Injectable, Logger } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';

@Injectable()
export class MessagesDomain extends BaseDomainAbstract<Message> {
  logger = new Logger(MessagesDomain.name);

  constructor(private readonly messageRepo: MessagesRepository) {
    super(messageRepo);
  }

  async createMessage(
    message: string,
    senderId: string,
    contentType: MessageType = MessageType.TEXT,
    session?: ClientSession,
  ): Promise<CreateEntityResponse<Message>> {
    return await this.messageRepo.createMessage(
      message,
      senderId,
      contentType,
      session,
    );
  }
}
