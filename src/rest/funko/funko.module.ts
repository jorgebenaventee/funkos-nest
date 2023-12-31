import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { FunkoMapper } from './funko-mapper/funko-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from '@/rest/funko/entities/funko.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Funko])],
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
})
export class FunkoModule {}
