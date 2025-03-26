import { Expose } from 'class-transformer';

export class AddressDto {
  @Expose()
  id: string;

  @Expose()
  address: string;
}
