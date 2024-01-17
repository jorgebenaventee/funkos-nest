import { Order } from '@/rest/order/entities/order.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { CreateOrderDto } from './dto/create-order.dto'
import type { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order, 'mongo')
    private orderRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order'
  }

  async findAll() {
    return await this.orderRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} order`
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`
  }

  remove(id: number) {
    return `This action removes a #${id} order`
  }
}
