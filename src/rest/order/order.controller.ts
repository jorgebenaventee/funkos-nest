import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { Roles } from '@/auth/roles-auth.guard'
import { ParseObjectIdPipe } from '@/rest/order/pipes/parse-object-id/parse-object-id.pipe'
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { ApiExcludeController } from '@nestjs/swagger'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderService } from './order.service'

@Controller('order')
@UseGuards(JwtAuthGuard)
@Roles('USER')
@ApiExcludeController()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto)
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return await this.orderService.findAll({
      page,
      limit,
      route: `${this.request.protocol}://${this.request.hostname}:${this.request.socket.localPort}${this.request.url}`,
    })
  }

  @Get(':id')
  async findOne(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
    return await this.orderService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseObjectIdPipe()) id: ObjectId,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto)
  }

  @Delete(':id')
  async remove(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
    return await this.orderService.remove(id)
  }
}
