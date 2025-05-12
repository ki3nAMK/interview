import { Injectable } from '@nestjs/common';
import { MessagesService } from './message.service';
import { ConversationsService } from './conversation.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageService: MessagesService,
    private readonly conversationService: ConversationsService,
  ) {}

  
}
