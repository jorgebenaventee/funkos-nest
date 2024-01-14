import { Category } from '@/rest/category/entities/category.entity'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { NotificationsModule } from '@/rest/notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CategoryModule } from './rest/category/category.module'
import { FunkoModule } from './rest/funko/funko.module'
import { StorageModule } from './rest/storage/storage.module'

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER ?? 'funko',
      password: process.env.POSTGRES_PASSWORD ?? 'funko',
      database: process.env.POSTGRES_DB ?? 'funko',
      synchronize: true,
      entities: [Funko, Category],
    }),
    FunkoModule,
    CategoryModule,
    NotificationsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
