import { Funko } from '@/rest/funko/entities/funko.entity'
import { Order } from '@/rest/order/entities/order.entity'
import { OrderMapper } from '@/rest/order/order-mapper/order-mapper'
import { UserService } from '@/rest/user/user.service'
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import type { ObjectId } from 'mongodb'
import { type IPaginationOptions, paginate } from 'nestjs-typeorm-paginate'
import { In, Repository } from 'typeorm'
import type { CreateOrderDto } from './dto/create-order.dto'
import type { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrderService {
  private logger = new Logger('OrderService')

  constructor(
    @InjectRepository(Order, 'mongo')
    private orderRepository: Repository<Order>,
    @Inject(REQUEST) private request: Request,
    private orderMapper: OrderMapper,
    private userService: UserService,
    @InjectRepository(Funko) private funkoRepository: Repository<Funko>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderMapper.toEntity(createOrderDto)
    if (!this.hasPermission({ order })) {
      throw new ForbiddenException(
        'You do not have permission to create orders for other users',
      )
    }
    if (!order.orderLines || order.orderLines?.length === 0) {
      throw new BadRequestException('Order must have at least one order line')
    }
    await this.checkOrder(order)
    const user = await this.userService.find(createOrderDto.userId)
    if (!user) {
      throw new BadRequestException('User does not exist')
    }
    return await this.orderRepository.save(order)
  }

  async findAll(paginateQuery: IPaginationOptions) {
    this.logger.log(`findAll with user id: ${this.getUserId()}`)
    const searchOptions = {
      where: this.isAdmin()
        ? undefined
        : {
            userId: this.getUserId(),
          },
    }
    return await paginate(this.orderRepository, paginateQuery, searchOptions)
  }

  async findOne(id: ObjectId) {
    const order = await this.orderRepository.findOne({ where: { _id: id } })
    if (!this.hasPermission({ order })) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    return order
  }

  async update(id: ObjectId, updateOrderDto: UpdateOrderDto) {
    const dbOrder = await this.orderRepository.findOne({ where: { _id: id } })
    if (!this.hasPermission({ order: dbOrder })) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    const user = await this.userService.find(updateOrderDto.userId)
    if (!user) {
      throw new BadRequestException('User does not exist')
    }
    const order = this.orderMapper.toEntity(updateOrderDto)
    await this.returnStock(dbOrder)
    await this.checkOrder(order)
    const orderToSave = await this.reserveStock(order)
    return await this.orderRepository.save(orderToSave)
  }

  async remove(id: ObjectId) {
    const order = await this.findOne(id)
    await this.returnStock(order)
    return await this.orderRepository.remove(order)
  }

  private isAdmin() {
    return this.request.user['roles'].includes('ADMIN')
  }

  private getUserId() {
    return this.request.user['id']
  }

  private hasPermission({ order }: { order: Order }) {
    const userId = this.getUserId()
    return order && (order.userId === userId || this.isAdmin())
  }

  private async checkOrder(order: Order) {
    if (!order.orderLines) {
      return
    }
    const funkoIds =
      order.orderLines?.map((orderLine) => orderLine.funkoId) ?? []
    const funkos = await this.funkoRepository.findBy({
      id: In(funkoIds),
    })

    if (funkos.length !== funkoIds.length) {
      const dbFunkoIds = funkos.map((funko) => funko.id)
      const funkoIdsNotFound = funkoIds.filter(
        (funkoId) => !dbFunkoIds.includes(funkoId),
      )
      throw new BadRequestException(
        `Funko ids not found: ${funkoIdsNotFound.join(', ')}`,
      )
    }

    for (const { funkoId, quantity, price, total } of order.orderLines) {
      const funko = funkos.find((funko) => funko.id === funkoId)
      if (funko.stock < quantity) {
        throw new BadRequestException(
          `Funko with id ${funkoId} does not have enough stock`,
        )
      }
      if (Number(funko.price) !== price) {
        throw new BadRequestException(
          `Funko with id ${funkoId} has a different price`,
        )
      }
      if (quantity * price !== total) {
        throw new BadRequestException(
          `Funko with id ${funkoId} has a different total`,
        )
      }
    }
  }

  private async reserveStock(order: Order) {
    if (!order.orderLines) {
      return order
    }
    const funkos = await this.funkoRepository.findBy({
      id: In(order.orderLines.map((orderLine) => orderLine.funkoId)),
    })

    for (const orderLine of order.orderLines) {
      const funko = funkos.find((funko) => funko.id === orderLine.funkoId)
      funko.stock -= orderLine.quantity
      await this.funkoRepository.save(funko)
    }

    order.total = order.orderLines.reduce(
      (total, orderLine) => total + orderLine.quantity * orderLine.price,
      0,
    )

    order.totalItems = order.orderLines.reduce(
      (totalItems, orderLine) => totalItems + orderLine.quantity,
      0,
    )

    return order
  }

  private async returnStock(order: Order) {
    if (order.orderLines) {
      const funkos = await this.funkoRepository.findBy({
        id: In(order.orderLines.map((orderLine) => orderLine.funkoId)),
      })
      for (const orderLine of order.orderLines) {
        const funko = funkos.find((funko) => funko.id === orderLine.funkoId)
        funko.stock += orderLine.quantity
        await this.funkoRepository.save(funko)
      }
    }
  }
}
