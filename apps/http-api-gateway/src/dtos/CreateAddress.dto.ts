import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'address must be string' })
  @IsOptional()
  address?: string;
}
