import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class StudentDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty({ message: 'id fied is requird!' })
  id: string;

  @Expose()
  @IsNotEmpty({ message: 'name fied is requird!' })
  name: string;

  @Expose()
  @IsNotEmpty({ message: 'email fied is requird!' })
  @IsEmail({}, { message: 'email format is invalid!' })
  email: string;
}
