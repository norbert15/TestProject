import { HttpStatus, Injectable } from '@nestjs/common';
import { AddressEntity } from './entities/address.entity';
import { InsertResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { AddressDto } from '@libs/shared';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AddressService {
  /**
   * Útca nevek a random cím generáláshoz
   */
  private readonly STREETS: string[] = [
    'Ady köz',
    'Petófi út',
    'Sport u.',
    'Nagy tér',
    'Víztorony',
  ];

  /**
   * Város nevek a random cím generáláshoz
   */
  private readonly CITIES: Array<{ city: string; irsz: number }> = [
    { city: 'Budapest', irsz: 1011 },
    { city: 'Debrecen', irsz: 4225 },
    { city: 'Anarcs', irsz: 4546 },
    { city: 'Kisvárda', irsz: 4600 },
    { city: 'Szeged', irsz: 6700 },
  ];

  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  /**
   * Címek listájának lekérdezése az adatbázisból
   *
   * @returns {Promise<AddressDto[]>}
   */
  async getAllAddresses(limit: number, offset: number): Promise<AddressDto[]> {
    try {
      // Címek listájának lekérdezése
      const addresses = await this.addressRepository.find({
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return plainToInstance(AddressDto, addresses, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  insertBulk(addresses: AddressEntity[]): Promise<InsertResult> {
    return this.addressRepository.insert(addresses);
  }

  /**
   * Új cím létrehozása és mentése az adatbázisba,
   *
   * - Ha nincs átadva cím (null, undefined vagy üres) paraméterben, akkor egy random cím kerül generálásra.
   *
   * @param {string | null} address (Opcionális) az új cím értéke
   * @returns {Promise<AddressDto>} Az új létrehozott cím
   */
  async createAddress(address?: string | null): Promise<AddressDto> {
    // Ha nincs cím megadva generálnuk egy random címet
    if (!address) {
      address = this.getRandomAddress();
    }

    try {
      // Cím létrehozása
      const createdAddress = this.addressRepository.create({
        address,
        id: randomUUID(),
      });

      // Létrehozott cím mentése adatbázisba
      const savedAddress: AddressEntity =
        await this.addressRepository.save(createdAddress);

      return plainToInstance(AddressDto, savedAddress, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  /**
   * Random cím generálása
   *
   * @returns {string}
   */
  public getRandomAddress(): string {
    const randomStreet =
      this.STREETS[Math.floor(Math.random() * this.STREETS.length)];
    const randomCity =
      this.CITIES[Math.floor(Math.random() * this.CITIES.length)];
    const houseNumber = Math.floor(Math.random() * 200) + 1;

    return `${randomCity.irsz}, ${randomCity.city} ${randomStreet} ${houseNumber}`;
  }
}
