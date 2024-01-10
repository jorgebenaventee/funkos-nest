import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { Module } from '@nestjs/common'

@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
