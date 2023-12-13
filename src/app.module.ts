import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FunkoModule } from './rest/funko/funko.module'

@Module({
  imports: [FunkoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
