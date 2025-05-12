import { CurrentUser } from '@/decorators/current-user.decorator';
import { UploadMessageRequest } from '@/dtos/requests/upload-message.request';
import { OkResponse } from '@/dtos/responses/ok.response';
import { UserListResponse } from '@/dtos/responses/user-list.response';
import { SessionType } from '@/enums/session-type.enum';
import { JwtAccessTokenGuard } from '@/guards/jwt-access-token.guard';
import { Conversation } from '@/models/conversation.schema';
import { ChatService } from '@/services/chat.service';
import { ConversationsService } from '@/services/conversation.service';
import { UsersService } from '@/services/user.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth(SessionType.ACCESS)
@Controller({
  version: '1',
  path: 'chat',
})
@UseGuards(JwtAccessTokenGuard)
@ApiTags('Chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationsService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  @ApiOkResponse({ type: () => Conversation })
  @HttpCode(HttpStatus.OK)
  @Get('/conversations/:conversationId')
  async getConversation(
    @CurrentUser() userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return await this.conversationsService.getConversationDetail(
      userId,
      conversationId,
    );
  }

  @ApiOkResponse({ type: () => OkResponse })
  @HttpCode(HttpStatus.OK)
  @Post('/conversations')
  async createNewConversation(
    @CurrentUser() userId: string,
    @Body() body: UploadMessageRequest,
  ) {
    return await this.conversationsService.createNewConversation(userId, body);
  }

  @ApiOkResponse({ type: () => UserListResponse })
  @HttpCode(HttpStatus.OK)
  @Get('/online-users')
  async getOnlineUsers(@CurrentUser() userId: string) {
    return await this.userService.findAllUsers(userId);
  }
}
