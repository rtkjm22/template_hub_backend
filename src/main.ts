import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as fs from 'fs'

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'), // 秘密鍵
    cert: fs.readFileSync('localhost.pem') // 証明書
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions
  })

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])

  // CORS設定 (Next.js フロントとは別ポートで通信する場合など)
  app.enableCors({
    origin: 'https://localhost:3000',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight'
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
  })

  // サーバ起動
  await app.listen(3001)
}
bootstrap()
