export interface NotificationDto {
  id: number;
  guid: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
