import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from './user.type'
import { RegisterDto } from '../auth/dto'

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
  async searchUsers(@Args('lastName') lastName: string) {
    return this.userService.searchUsers(lastName)
  }
}
