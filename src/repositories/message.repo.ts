import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { CreateEntityResponse } from '@/dtos/responses/create-entity.response';
import { MessageType } from '@/enums/message-type.enum';
import { Message } from '@/models/message.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { head, isNil } from 'lodash';
import { ClientSession, Model, Types } from 'mongoose';

@Injectable()
export class MessagesRepository extends BaseRepositoryAbstract<Message> {
  constructor(
    @InjectModel(Message.name)
    private readonly messages_repository: Model<Message>,
  ) {
    super(messages_repository);
  }

  async createMessage(
    message: string,
    senderId: string,
    contentType: MessageType = MessageType.TEXT,
    session?: ClientSession,
  ): Promise<CreateEntityResponse<Message>> {
    const newMessage = await this.messages_repository.create(
      [
        {
          senderId: new Types.ObjectId(senderId),
          body: message,
          contentType,
        },
      ],
      ...(!isNil(session) ? [{ session }] : []),
    );

    return head(newMessage) as CreateEntityResponse<Message>;
  }
}
