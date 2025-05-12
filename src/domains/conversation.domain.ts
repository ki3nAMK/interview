import { BaseDomainAbstract } from '@/base/abstract-domain.base';
import { MessageType } from '@/enums/message-type.enum';
import { Conversation } from '@/models/conversation.schema';
import { ConversationsRepository } from '@/repositories/conversation.repo';
import { Injectable, Logger } from '@nestjs/common';
import { MessagesDomain } from './message.domain';
import { TransactionDomain } from './transaction.domain';
import { SendMessageResponse } from '@/dtos/responses/send-messgae.response';
import { UploadMessageRequest } from '@/dtos/requests/upload-message.request';
import { UsersDomain } from './user.domain';
import { isNil } from 'lodash';

@Injectable()
export class ConversationsDomain extends BaseDomainAbstract<Conversation> {
  logger = new Logger(ConversationsDomain.name);

  constructor(
    private readonly conversationRepo: ConversationsRepository,
    private readonly messageDomain: MessagesDomain,
    private readonly transactionDomain: TransactionDomain,
    private readonly userDomain: UsersDomain,
  ) {
    super(conversationRepo);
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    message: string,
    messageType: MessageType = MessageType.TEXT,
  ): Promise<SendMessageResponse> {
    const result = await this.transactionDomain.startTransaction?.(
      async (session) => {
        const newMessage = await this.messageDomain.createMessage(
          message,
          userId,
          messageType,
          session,
        );

        const messageId = newMessage._id.toString();

        await this.conversationRepo.updateConversation(
          conversationId,
          messageId,
          session,
        );

        return {
          conversationId: conversationId,
          messageId,
        };
      },
    );

    return result;
  }

  async createNewConversation(userId: string, body: UploadMessageRequest) {
    const { message, memberIds } = body;
    await this.userDomain.checkIfUsersExist(memberIds);

    const isExist = await this.conversationRepo.checkIfConversationExist([
      userId,
      ...memberIds,
    ]);

    const result = await this.transactionDomain.startTransaction?.(
      async (session) => {
        const newMessage = await this.messageDomain.createMessage(
          message,
          userId,
          MessageType.TEXT,
          session,
        );

        const messageId = newMessage._id.toString();

        if (isNil(isExist)) {
          // * create new conversation
          const newConversation =
            await this.conversationRepo.createNewConversation(
              [userId, ...memberIds],
              messageId,
              session,
            );

          return {
            conversationId: newConversation?._id.toString(),
            messageId,
            isNew: true,
          };
        }

        // * update existing conversation
        await this.conversationRepo.updateConversation(
          isExist._id.toString(),
          messageId,
          session,
        );

        return {
          conversationId: isExist._id.toString(),
          messageId,
          isNew: false,
        };
      },
    );

    return result;
  }
}
