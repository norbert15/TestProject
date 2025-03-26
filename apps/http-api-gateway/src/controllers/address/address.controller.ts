import { AddressDto, JwtAuthGuad } from '@libs/shared';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateAddressDto } from '../../dtos/CreateAddress.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuad)
export class AddressController {
  constructor(
    @Inject('NATS_SERVER') private readonly natsServer: ClientProxy,
  ) {}

  @Get('list')
  getAllAddresses(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ): Promise<AddressDto[]> {
    return firstValueFrom(
      this.natsServer.send('getAllAddresses', { limit, offset }),
    );
  }

  @Post('create')
  createAddress(@Body() address?: CreateAddressDto): Promise<AddressDto> {
    return firstValueFrom(
      this.natsServer.send('createAddress', address?.address ?? ''),
    );
  }
}
