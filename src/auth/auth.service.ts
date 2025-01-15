import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto'
import { User } from '@prisma/client'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async register(registerDto: RegisterDto, response: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    })

    if (existingUser) {
      throw new BadRequestException({
        email: 'このメールアドレスはすでに使用されています。'
      })
    }
    const salt = 10
    const hashedPassword = await bcrypt.hash(registerDto.password, salt)
    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword
      }
    })
    return this.issueToken(user, response)
  }

  private async issueToken(user: User, response: Response) {
    const payload = {
      username: `${user.lastName}${user.firstName}${user.email}`,
      sub: user.id
    }

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '300sec'
      }
    )

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d'
    })

    response.cookie('access_token', accessToken, { httpOnly: true })
    response.cookie('refresh_token', refreshToken, { httpOnly: true })

    return { user }
  }

  // async signIn(
  //   username: string,
  //   pass: string
  // ): Promise<{ access_token: string }> {
  //   const user = await this.usersService.findOne(username)
  //   if (user?.password !== pass) {
  //     throw new UnauthorizedException()
  //   }
  //   const payload = { sub: user.userId, username: user.username }
  //   return {
  //     access_token: await this.jwtService.signAsync(payload)
  //   }
  // }
}
