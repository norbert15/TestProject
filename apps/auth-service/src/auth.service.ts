import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepositroy: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  /**
   * Új felhasználói fiók létrehozása paraméterben megadott adatok alapján
   *
   * @param {string} username felhasználónév
   * @param {string} password felhasználó jelszava
   * @returns {Promise<UserEntity>} A létrehozott új felhasználó objektuma
   */
  async createUser(username: string, password: string): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const createdUser = this.userRepositroy.create({
        username,
        password: hashedPassword,
        id: randomUUID(),
      });

      return this.userRepositroy.save(createdUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Felhasználó lekérdezése felhasználónév és jelszó páros alapján, majd JWT token generálása és visszaadása
   *
   * @param {string} username felhasználóneve
   * @param {string} password felhasználó jelszava
   * @returns {Promise<string>} Az új generált JWT token
   */
  async login(username: string, password: string): Promise<string> {
    const user: UserEntity = await this.validateUser(username, password);
    return this.jwtService.signAsync({ sub: user.id });
  }

  /**
   * Felhasználó lekérdezése felhasználónév alapján
   *
   * @param {string} username felhasználóneve
   * @returns {Promise<UserEntity | null>} A lekérdezett felhasználó, ha nem létezik akkor null
   */
  findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepositroy.findOneBy({ username });
  }

  private async validateUser(
    username: string,
    password: string,
  ): Promise<UserEntity> {
    // Felhasználó lekérése felhasználónév alapján
    const user: UserEntity | null = await this.findByUsername(username);

    // Ha nem található ilyen felhasználó
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Wrong username or password',
      });
    }

    // Jelszó egyezőség vizsgálata
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Wrong username or password',
      });
    }

    return user;
  }
}
