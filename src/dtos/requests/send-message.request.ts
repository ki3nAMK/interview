import { IsNotEmpty, IsString } from 'class-validator';

export class SentMessageRequest {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  conversationId: string;
}
