import { BaseEntity } from '@/base/entity.base';
import { ConversationType } from '@/enums/conversation-type.enum';
import { User } from '@/models/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Message } from './message.schema';
import { ApiProperty } from '@nestjs/swagger';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({
  timestamps: true,
})
export class Conversation extends BaseEntity {
  @ApiProperty({
    example: ConversationType.ONE_TO_ONE,
    description: 'Type of the conversation (e.g., ONE_TO_ONE, GROUP).',
  })
  @Prop({ enum: ConversationType, required: true })
  type: ConversationType;

  @ApiProperty({
    example: ['60d21b4667d0d8992e610c85', '60d21b4967d0d8992e610c86'],
    description: 'Array of user IDs participating in the conversation.',
  })
  @Prop({ type: [{ type: Types.ObjectId }], ref: User.name, required: true })
  participants: User[];

  @ApiProperty({
    example: ['60d21b8667d0d8992e610c87', '60d21b8967d0d8992e610c88'],
    description: 'Array of message IDs associated with the conversation.',
  })
  @Prop({ type: [{ type: Types.ObjectId }], ref: Message.name, required: true })
  messages: Message[];

  @ApiProperty({
    example: '2025-05-12T10:00:00.000Z',
    description: 'Timestamp of the last activity in the conversation.',
  })
  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
