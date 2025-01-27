import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { SigninResponse, LoginResponse, UpdateTokenResponse } from './types'
import { LoginDto, SigninDto } from './dto'
import { BadRequestException, UseFilters } from '@nestjs/common'
import { Request } from 'express'
import { GraphQLErrorFilter } from '../filters/custom-exception.filter'

@UseFilters(GraphQLErrorFilter)
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SigninResponse)
  async signin(
    @Args('signinInput') signinDto: SigninDto,
    @Context() context: { req: Request }
  ) {
    if (signinDto.password !== signinDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'パスワードが一致していません。'
      })
    }
    const { user } = await this.authService.signin(signinDto, context.req.res)
    return { user }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: { req: Request }
  ) {
    return this.authService.login(loginDto, context.req.res)
  }

  @Mutation(() => String)
  async logout(@Context() context: { req: Request }) {
    return this.authService.logout(context.req.res)
  }

  @Query(() => UpdateTokenResponse)
  async updateToken(@Context() context: { req: Request }) {
    try {
      return await this.authService.updateToken(context.req, context.req.res)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
