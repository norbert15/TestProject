import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockStudentRepositroy } from '@libs/shared';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressEntity } from './entities/address.entity';

describe('AddressController', () => {
  let addressController: AddressController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(AddressEntity),
          useClass: MockStudentRepositroy<AddressEntity>,
        },
      ],
    }).compile();

    addressController = app.get<AddressController>(AddressController);
  });

  it('should be create a new address', async () => {
    const address = '4546, KisOdú malom utca 5.';
    const createdAddress = await addressController.createAddress(address);

    expect(createdAddress).toBeDefined();
    expect(createdAddress.address).toBe(address);
    expect(createdAddress).toHaveProperty('id');
  });

  it('should be create a random address', async () => {
    const createdAddress = await addressController.createAddress();

    expect(createdAddress).toBeDefined();
    expect(createdAddress).toHaveProperty('address');
    expect(createdAddress).toHaveProperty('id');
  });
});
