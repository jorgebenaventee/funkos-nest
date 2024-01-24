import { setupSwagger } from '@/setup-swagger'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { configDotenv } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { AppModule } from './app.module'

configDotenv()

async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('Running in dev mode')
  } else {
    console.log('Running in production mode')
  }
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync(resolve(process.env.KEYSTORE_PATH)),
      cert: readFileSync(resolve(process.env.CERT_PATH)),
    },
    cors: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.setGlobalPrefix('api')
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  await app
    .listen(3000)
    .then(async () => console.log(`Server running on: ${await app.getUrl()}`))
}

bootstrap()
