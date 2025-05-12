import { BaseRepositoryAbstract } from '@/base/abstract-repository.base';
import { CreateEntityResponse } from '@/dtos/responses/create-entity.response';
import { ListItemResponse } from '@/dtos/responses/list-item.response';
import { ConversationType } from '@/enums/conversation-type.enum';
import { Conversation } from '@/models/conversation.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { head, isNil, map, size } from 'lodash';
import { ClientSession } from 'mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConversationsRepository extends BaseRepositoryAbstract<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversations_repository: Model<Conversation>,
  ) {
    super(conversations_repository);
  }

  async getConversationDetail(
    participantId: string,
    conversationId: string,
  ): Promise<Conversation | null> {
    return await this.conversations_repository
      .findOne({
        _id: new Types.ObjectId(conversationId),
        participants: { $in: [new Types.ObjectId(participantId)] },
      })
      .populate([
        {
          path: 'participants',
        },
        {
          path: 'messages',
        },
      ])
      .lean()
      .exec();
  }

  async getAllRelatedConversations(
    participantId: string,
  ): Promise<ListItemResponse<Conversation>> {
    const [count, items] = await Promise.all([
      this.conversations_repository.countDocuments({
        participants: { $in: [new Types.ObjectId(participantId)] },
        deleted_at: null,
      }),
      this.conversations_repository
        .find({
          participants: { $in: [new Types.ObjectId(participantId)] },
        })
        .populate([
          {
            path: 'participants',
          },
          {
            path: 'messages',
          },
        ])
        .sort({ lastActivity: -1 })
        .lean()
        .exec(),
    ]);
    return {
      count,
      items,
    };
  }

  async updateConversation(
    conversationId: string,
    messageId: string,
    session?: ClientSession,
  ) {
    return await this.conversations_repository.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      {
        $push: { messages: new Types.ObjectId(messageId) },
        $set: { lastActivity: new Date() },
      },
      ...(!isNil(session) ? [{ session }] : []),
    );
  }

  async checkIfConversationExist(
    memberIds: string[],
  ): Promise<CreateEntityResponse<Conversation> | null> {
    const isExist = await this.conversations_repository.findOne({
      participants: {
        $size: memberIds.length,
        $all: memberIds.map((id) => new Types.ObjectId(id)),
      },
    });

    return isNil(isExist) ? null : isExist;
  }

  async createNewConversation(
    memberIds: string[],
    messageId: string,
    session?: ClientSession,
  ) {
    const result = await this.conversations_repository.create(
      [
        {
          participants: map(memberIds, (id) => new Types.ObjectId(id)),
          type:
            size(memberIds) === 2
              ? ConversationType.ONE_TO_ONE
              : ConversationType.GROUP,
          messages: [new Types.ObjectId(messageId)],
        },
      ],
      ...(!isNil(session) ? [{ session }] : []),
    );

    return head(result);
  }
}
