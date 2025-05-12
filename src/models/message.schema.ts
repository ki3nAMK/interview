import { BaseEntity } from '@/base/entity.base';
import { MessageType } from '@/enums/message-type.enum';
import { User } from '@/models/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message extends BaseEntity {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'The ID of the user who sent the message.',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: User;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The content of the message.',
  })
  @Prop({ type: String, required: true })
  body: string;

  @ApiProperty({
    example: MessageType.TEXT,
    description: 'The type of the message content. Defaults to TEXT.',
    enum: MessageType,
  })
  @Prop({ enum: MessageType, default: MessageType.TEXT })
  contentType: MessageType;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
