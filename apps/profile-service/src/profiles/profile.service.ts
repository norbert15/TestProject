import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentEntity } from '../entities/student.entity';
import { InsertResult, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateStudentDto, StudentDto } from '@libs/shared';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly profileRepository: Repository<StudentEntity>,
  ) {}

  /**
   * Diákok rekordjainak lekérdezése
   *
   * @returns {Promise<StudentDto[]>}
   */
  async findAllStudent(limit: number, offset: number): Promise<StudentDto[]> {
    try {
      // Diákok lekérdezése
      const profiles: StudentEntity[] = await this.profileRepository.find({
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      // Lekérdezett diákok átalakítása
      return plainToInstance(StudentDto, profiles, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  insertBulk(students: StudentEntity[]): Promise<InsertResult> {
    return this.profileRepository.insert(students);
  }

  /**
   * Paraméterben megadott adatok alapján az adatbázisban egy új rekord jön létre,
   * majd visszaadja azt
   *
   * @param {CreateStudentDto} student
   * @returns {Promise<StudentDto>}
   */
  async createStudent(student: CreateStudentDto): Promise<StudentDto> {
    try {
      // Új diák létrehozása
      const createdStudent: StudentEntity = this.profileRepository.create({
        email: student.email,
        name: student.name,
        id: randomUUID(),
      });

      // Létrehozott diák beszúrása az adatbázisba
      const savedStudent: StudentEntity =
        await this.profileRepository.save(createdStudent);

      return plainToInstance(StudentDto, savedStudent, {
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
   * Paraméterben megadott adatok alapján módosításra kerül a diák adatai
   *
   * @param {StudentDto} student
   */
  async updateStudent(student: StudentDto): Promise<StudentDto> {
    const { id, email, name } = student;

    // Diák ellenőrzése
    await this.findStudentById(id);

    try {
      // Diák új adataiank mentése
      await this.profileRepository.update(id, { email, name });

      return { id, email, name };
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  /**
   * Paraméterben megadott diák azonosító alapján eltávolításra kerül a talált diák rekord
   *
   * @param {string} studentId Diák egyedi azonosítója
   * @returns {string}
   */
  async deleteStudentById(studentId: string): Promise<string> {
    // Diák ellenőrzése, hogy létezik-e
    const student: StudentEntity = await this.findStudentById(studentId);

    try {
      // Diák eltávolítása
      await this.profileRepository.remove(student);

      return studentId;
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  /**
   * Paraméterben megadott azonosító alapján lekérdezésre kerül a hozzátartozó rekord
   *
   * @param {string} studentId diák rekord egyedi azonosítója
   * @returns {Promise<StudentEntity>} A lekérdezés eredménye
   */
  private async findStudentById(studentId: string): Promise<StudentEntity> {
    // Rekord lekérdezése id alapján
    const student: StudentEntity | null =
      await this.profileRepository.findOneBy({ id: studentId });

    // Ha a rekord nem létezik!
    if (!student) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Student not found!',
      });
    }

    return student;
  }
}
