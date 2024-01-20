import type { CreateOrderDto } from '@/rest/order/dto/create-order.dto'
import type { UpdateOrderDto } from '@/rest/order/dto/update-order.dto'
import { Order } from '@/rest/order/entities/order.entity'
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'

@Injectable()
export class OrderMapper {
  toEntity(dto: CreateOrderDto | UpdateOrderDto) {
    return plainToClass(Order, dto)
  }
}
