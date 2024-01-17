import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { RolesAuthGuard } from '@/auth/roles-auth.guard'
import { Role, User } from '@/rest/user/entities/user.entity'
import { UserMapper } from '@/rest/user/user.mapper'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UserService, JwtAuthGuard, RolesAuthGuard, UserMapper],
  exports: [UserService, UserMapper],
  controllers: [UserController],
})
export class UserModule {}
