import { BaseEntity } from '@/base/entity.base';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { userChatStatus } from '@/enums/user-chat-status.enum';
import { Role } from '@/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User extends BaseEntity {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user.',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the user. Must be unique and valid.',
  })
  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user. Must be a valid format.',
  })
  @Prop({
    match: /^([+]\d{2})?\d{10}$/,
  })
  phoneNumber: string;

  @ApiProperty({
    example: Role.CLIENT,
    description: 'The role of the user. Defaults to CLIENT.',
    enum: Role,
  })
  @Prop({ enum: Role, default: Role.CLIENT })
  role: Role;

  @ApiProperty({
    example: 'hashedpassword123',
    description: 'The hashed password of the user. Not returned in queries.',
  })
  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @ApiProperty({
    example: userChatStatus.ONLINE,
    description: 'The chat status of the user. Defaults to ONLINE.',
    enum: userChatStatus,
  })
  @Prop({ enum: userChatStatus, default: userChatStatus.ONLINE })
  status: userChatStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});