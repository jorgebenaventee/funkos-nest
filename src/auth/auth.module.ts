import { JwtAuthStrategy } from '@/auth/jwt.strategy'
import { UserModule } from '@/rest/user/user.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env' : '.env.prod',
    }),
    JwtModule.register({
      secret: btoa(process.env.JWT_SECRET),
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRATION_TIME) * 1000,
        algorithm: 'HS512',
      },
    }),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy],
})
export class AuthModule {}
