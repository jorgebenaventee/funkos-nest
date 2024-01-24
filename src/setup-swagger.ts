import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Funkos NestJS')
    .setDescription('API REST para la gestión de Funkos')
    .setContact('Jorge Benavente Liétor', 'https://jorgebenavente.com', '')
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con Funkos')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
}
