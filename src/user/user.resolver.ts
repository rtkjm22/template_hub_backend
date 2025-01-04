import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from './user.type'
import { Request } from 'express'
import { RegisterDto } from './dto'
import { BadRequestException } from '@nestjs/common'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => String)
  piyo(): string {
    return this.userService.getHello()
  }

  @Mutation(() => User)
  async register(@Args('registerInput') registerDto: RegisterDto) {
    return await this.userService.register(registerDto)
  }

  @Query(() => [User])
  async searchUsers(
    @Args('fullname') fullname: string,
    @Context() context: { req: Request }
  ) {
    return this.userService.searchUsers(fullname)
  }
}
