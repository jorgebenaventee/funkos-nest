import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FunkoModule } from './rest/funko/funko.module'
import { CategoryModule } from './rest/category/category.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER ?? 'funko',
      password: process.env.POSTGRES_PASSWORD ?? 'funko',
      database: 'funko',
      entities: [`${__dirname}/**/*.entity.{js,ts}`],
      synchronize: true,
    }),
    FunkoModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
