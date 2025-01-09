import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { PrismaService } from 'src/prisma.service'
import { UserController } from './user.controller'

@Module({
  controllers: [UserController],
  providers: [UserService, UserResolver, PrismaService]
})
export class UserModule {}
