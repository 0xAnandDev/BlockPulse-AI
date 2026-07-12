import 'reflect-metadata'

// Prisma returns BigInt for BlockchainEvent.blockNumber / Wallet.lastProcessedBlock.
// JSON.stringify can't serialize BigInt natively — teach it to, process-wide.
;(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString()
}

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BlockPulse AI API')
    .setDescription('Authentication and platform API for BlockPulse AI')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ? Number(process.env.PORT) : 4000
  await app.listen(port)
}

bootstrap()
