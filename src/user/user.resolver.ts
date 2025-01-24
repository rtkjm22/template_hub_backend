import { Resolver, Query, Args } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User } from './user.type'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => String)
  piyo(): string {
    return this.userService.getHello()
  }

  @Query(() => [User])
  async searchUsers(@Args('lastName') lastName: string) {
    return this.userService.searchUsers(lastName)
  }
}
