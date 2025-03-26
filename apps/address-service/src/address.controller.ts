import { Controller } from '@nestjs/common';
import { AddressService } from './address.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddressDto } from '@libs/shared';

@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @MessagePattern('getAllAddresses')
  getAllAddresses(
    @Payload() data: { limit: number; offset: number },
  ): Promise<AddressDto[]> {
    return this.addressService.getAllAddresses(data.limit, data.offset);
  }

  @MessagePattern('createAddress')
  createAddress(@Payload() address?: string): Promise<AddressDto> {
    return this.addressService.createAddress(address);
  }
}
