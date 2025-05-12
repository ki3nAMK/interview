import { BaseEntity } from '@/base/entity.base';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type SessionDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class Session extends BaseEntity {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'The ID of the user associated with this session.',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({
    example: '2025-05-12T12:00:00.000Z',
    description: 'The expiration date and time of the session.',
  })
  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
