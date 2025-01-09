import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // CORS設定 (Next.js フロントとは別ポートで通信する場合など)
  app.enableCors()

  // サーバ起動
  await app.listen(3001)
}
bootstrap()
