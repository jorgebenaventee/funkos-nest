import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { FunkoMapper } from './funko-mapper/funko-mapper'

@Module({
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
})
export class FunkoModule {}
