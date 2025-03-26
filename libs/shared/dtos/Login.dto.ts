import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'username field is required!' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password field is required!' })
  password: string;
}
