import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: '必須項目です。' })
  @IsString({ message: '文字列で入力してください。' })
  lastName: string

  @Field()
  @IsNotEmpty({ message: '必須項目です。' })
  @IsString({ message: '文字列で入力してください。' })
  firstName: string

  @Field()
  @IsNotEmpty({ message: '必須項目です。' })
  @IsString({ message: '文字列で入力してください。' })
  lastNameKana: string

  @Field()
  @IsNotEmpty({ message: '必須項目です。' })
  @IsString({ message: '文字列で入力してください。' })
  firstNameKana: string

  @Field()
  @IsNotEmpty({ message: '必須項目です。' })
  @IsEmail({}, { message: '不正なメール形式です。' })
  email: string
}
