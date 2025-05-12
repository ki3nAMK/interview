import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.schema';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from '@/base/entity.base';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Notification extends BaseEntity {
  @ApiProperty({
    type: String,
    description: 'The ID of the user associated with the notification',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({
    description: 'The message content of the notification',
    example: 'You have a new message from John Doe.',
  })
  @Prop({ required: true })
  message: string;

  @ApiProperty({
    description: 'Indicates whether the notification has been read',
    default: false,
    example: false,
  })
  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
