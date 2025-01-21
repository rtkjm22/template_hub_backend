import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  getHello() {
    return 'piyopiyo'
  }

  async searchUsers(lastName: string) {
    return this.prisma.user.findMany({
      where: {
        lastName: {
          contains: lastName
        }
      }
    })
  }
}
