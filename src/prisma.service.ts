import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect() // アプリ起動時にDBへ接続
  }

  async onModuleDestroy() {
    await this.$disconnect() // アプリ停止時にDB切断
  }
}
