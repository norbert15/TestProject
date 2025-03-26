import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { AddressController } from './address.controller';
import { AddressDto } from '@libs/shared';
import { randomUUID } from 'crypto';

describe('AddressController', () => {
  let addressController: AddressController;
  let clientProxyMock: Partial<ClientProxy>;

  const addresses: AddressDto[] = [
    { address: '4546, Kanizsa tér köz 12.', id: '1' },
  ];

  const customAddress = '4545, Téglés föld út 5.';

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn((pattern, data: any): Observable<any> => {
        if (pattern === 'getAllAddresses') {
          return of(addresses);
        }

        if (pattern === 'createAddress') {
          return of({
            id: randomUUID(),
            address: data || customAddress,
          });
        }

        return of(null);
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [{ provide: 'NATS_SERVER', useValue: clientProxyMock }],
    }).compile();

    addressController = app.get<AddressController>(AddressController);
  });

  it('should return an address list', async () => {
    const list = await addressController.getAllAddresses(100, 0);

    expect(list).toEqual(addresses);
    expect(clientProxyMock.send).toHaveBeenCalledWith('getAllAddresses', {
      limit: 100,
      offset: 0,
    });
  });

  it('should create a custom address', async () => {
    const address = '1111, Budapest FŐ uca 10.';
    const createdAddress = await addressController.createAddress({ address });

    expect(createdAddress).toBeDefined();
    expect(createdAddress).toHaveProperty('id');
    expect(createdAddress.address).toBe(address);

    expect(clientProxyMock.send).toHaveBeenCalledWith('createAddress', address);
  });

  it('should create a random address', async () => {
    const createdAddress = await addressController.createAddress();

    expect(createdAddress).toBeDefined();
    expect(createdAddress).toHaveProperty('id');
    expect(createdAddress.address).toBe(customAddress);

    expect(clientProxyMock.send).toHaveBeenCalledWith('createAddress', '');
  });
});
