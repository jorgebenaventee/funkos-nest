import { FunkoModule } from '@/rest/funko/funko.module'
import { Order } from '@/rest/order/entities/order.entity'
import { UserModule } from '@/rest/user/user.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderMapper } from './order-mapper/order-mapper'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'

@Module({
  controllers: [OrderController],
  imports: [
    TypeOrmModule.forFeature([Order], 'mongo'),
    UserModule,
    FunkoModule,
  ],
  providers: [OrderService, OrderMapper],
})
export class OrderModule {}
