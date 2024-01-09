import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, type Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import type { CategoryResponseDto } from '@/rest/category/dto/category-response.dto'

export const SOCKET_KEYS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name)
  @WebSocketServer()
  private server: Server

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.server.to(client.id).emit('connections', 'Connected to server')
  }

  sendMessage(
    event: (typeof SOCKET_KEYS)[keyof typeof SOCKET_KEYS],
    message: FunkoResponseDto | CategoryResponseDto,
  ) {
    const eventKey = `${event}_${this.isFunko(message) ? 'funko' : 'category'}`
    this.server.emit(eventKey, message)
  }

  private isFunko(
    message: FunkoResponseDto | CategoryResponseDto,
  ): message is FunkoResponseDto {
    return (message as FunkoResponseDto).image !== undefined
  }
}
