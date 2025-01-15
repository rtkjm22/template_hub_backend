import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { RegisterResponse } from './types'
import { RegisterDto } from './dto'
import { BadRequestException, UseFilters } from '@nestjs/common'
import { Request } from 'express'
import { GraphQLErrorFilter } from '../filters/custom-exception.filter'

@UseFilters(GraphQLErrorFilter)
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { req: Request }
  ) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'パスワードが一致していません。'
      })
    }
    const { user } = await this.authService.register(
      registerDto,
      context.req.res
    )
    return { user }
  }
}
