import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'name fied is requird!' })
  name: string;

  @IsNotEmpty({ message: 'email fied is requird!' })
  @IsEmail({}, { message: 'email format is invalid!' })
  email: string;
}
