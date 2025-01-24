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

  // プリフライトリクエストのミドルウェア
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', 'https://localhost:3000')
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return res.sendStatus(204) // プリフライトリクエストの成功レスポンス
    }
    next()
  })

  // サーバ起動
  await app.listen(3001)
}
bootstrap()
