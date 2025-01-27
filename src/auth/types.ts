import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/user/user.type'

@ObjectType()
export class SigninResponse {
  @Field(() => User, { nullable: true })
  user?: User
}

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User
}

@ObjectType()
export class UpdateTokenResponse {
  @Field(() => User, { nullable: true })
  user?: User
}
