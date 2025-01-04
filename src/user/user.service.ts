import { Injectable } from '@nestjs/common'
import { RegisterDto } from './dto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  getHello() {
    return 'ふがふがふが'
  }
  async register(registerDto: RegisterDto) {
    const user = await this.prisma.user.create({
      data: { ...registerDto }
    })
    return user
  }

  async searchUsers(fullname: string) {
    return this.prisma.user.findMany({
      where: {
        fullname: {
          contains: fullname
        }
      }
    })
  }
}
