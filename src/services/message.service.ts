import { MessagesDomain } from '@/domains/message.domain';
import { MessagesRepository } from '@/repositories/message.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepo: MessagesRepository,
    private readonly messageDomain: MessagesDomain,
  ) {}
}
