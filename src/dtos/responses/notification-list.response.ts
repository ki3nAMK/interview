import { Notification } from '@/models/notification.schema';

export class NotificationListResponse {
  items: Notification[];
  total: number;
}
