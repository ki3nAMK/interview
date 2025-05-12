import { ConversationsDomain } from '@/domains/conversation.domain';
import { UploadMessageRequest } from '@/dtos/requests/upload-message.request';
import { ListItemResponse } from '@/dtos/responses/list-item.response';
import { SendMessageResponse } from '@/dtos/responses/send-messgae.response';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { MessageType } from '@/enums/message-type.enum';
import { Conversation } from '@/models/conversation.schema';
import { trimObjectValues } from '@/pipes/trim-object-value.pipe';
import { ConversationsRepository } from '@/repositories/conversation.repo';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { includes, isNil, omit } from 'lodash';
import { NotificationsService } from './notification.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationRepo: ConversationsRepository,
    private readonly conversationDomain: ConversationsDomain,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationsService,
  ) {}

  async getConversationDetail(
    userId: string,
    conversationId: string,
  ): Promise<Conversation> {
    const result = await this.conversationRepo.getConversationDetail(
      userId,
      conversationId,
    );

    if (isNil(result)) {
      throw new NotFoundException(ErrorDictionary.CONVERSATION_NOT_FOUND);
    }

    return trimObjectValues(result);
  }

  async getAllRelatedConversations(
    userId: string,
  ): Promise<ListItemResponse<Conversation>> {
    return await this.conversationRepo.getAllRelatedConversations(userId);
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    message: string,
    messageType: MessageType = MessageType.TEXT,
  ): Promise<SendMessageResponse> {
    return await this.conversationDomain.sendMessage(
      userId,
      conversationId,
      message,
      messageType,
    );
  }

  async createNewConversation(
    userId: string,
    body: UploadMessageRequest,
  ): Promise<SendMessageResponse> {
    const { memberIds } = body;

    if (includes(memberIds, userId))
      throw new NotFoundException(ErrorDictionary.USER_MUST_NOT_BE_MEMBER);

    const result = await this.conversationDomain.createNewConversation(
      userId,
      body,
    );

    const isNewConversation = result.isNew;

    switch (isNewConversation) {
      case true:
        this.eventEmitter.emit('conversation.new', {
          conversationId: result.conversationId,
          userId,
          body,
        });

        await this.notificationService.sendMessageWhenNewGroupCreated(
          userId,
          memberIds,
        );
        break;
      case false:
        this.eventEmitter.emit('conversation.send_message', {
          conversationId: result.conversationId,
          userId,
          body,
          type: MessageType.TEXT,
          messageId: result.messageId,
        });
        break;
    }

    return omit(result, ['isNew']);
  }
}
