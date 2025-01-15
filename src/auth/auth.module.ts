import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.service'
import { AuthResolver } from './auth.resolver'

@Module({
  providers: [AuthResolver, AuthService, JwtService, PrismaService]
})
export class AuthModule {}
