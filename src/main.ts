import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configDotenv } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

configDotenv()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync(resolve(process.env.KEYSTORE_PATH)),
      cert: readFileSync(resolve(process.env.CERT_PATH)),
    },
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.setGlobalPrefix('api')
  await app
    .listen(3000)
    .then(async () => console.log(`Server running on: ${await app.getUrl()}`))
}

bootstrap()
