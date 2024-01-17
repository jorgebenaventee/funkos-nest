import { Order } from '@/rest/order/entities/order.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'

@Module({
  controllers: [OrderController],
  imports: [TypeOrmModule.forFeature([Order], 'mongo')],
  providers: [OrderService],
})
export class OrderModule {}
