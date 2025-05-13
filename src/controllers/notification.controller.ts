import { CurrentUser } from '@/decorators/current-user.decorator';
import { NotificationListResponse } from '@/dtos/responses/notification-list.response';
import { SessionType } from '@/enums/session-type.enum';
import { JwtAccessTokenGuard } from '@/guards/jwt-access-token.guard';
import { NotificationsService } from '@/services/notification.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth(SessionType.ACCESS)
@Controller({
  version: '1',
  path: 'notifications',
})
@UseGuards(JwtAccessTokenGuard)
@ApiTags('Notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationsService) {}

  @ApiOkResponse({ type: () => NotificationListResponse })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get notification detail',
    description: 'Get notification detail by userId',
  })
  @Get()
  async getAllNotifications(@CurrentUser() userId: string) {
    return await this.notificationService.getAllNotifications(userId);
  }
}
