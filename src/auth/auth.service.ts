import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { LoginDto, SigninDto } from './dto'
import { User } from '@prisma/client'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async signin(signinDto: SigninDto, response: Response) {
    const {
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      email,
      password
    } = signinDto
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new BadRequestException({
        email: 'このメールアドレスはすでに使用されています。'
      })
    }
    const salt = 10
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await this.prisma.user.create({
      data: {
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        email,
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

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 300 * 1000
    })
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return { user }
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto)
    if (!user) {
      throw new BadRequestException({
        invalidCredentials: 'ログイン情報に誤りがあります。'
      })
    }
    return this.issueToken(user, response)
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email }
    })

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      return user
    }
    return null
  }

  async logout(response: Response) {
    response.clearCookie('access_token')
    response.clearCookie('refresh_token')
    console.log('ログアウトが成功しました。')
    return 'ログアウトが成功しました。'
  }
}
