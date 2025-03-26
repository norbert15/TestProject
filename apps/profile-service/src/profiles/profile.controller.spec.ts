import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { StudentEntity } from '../entities/student.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CreateStudentDto,
  MockStudentRepositroy,
  StudentDto,
} from '@libs/shared';

describe('ProfileController', () => {
  let profileController: ProfileController;

  const newStudent: CreateStudentDto = {
    name: 'Nagy Lajos',
    email: 'nagy.lajos@gmail.com',
  };
  let createdStudentId: string;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(StudentEntity),
          useClass: MockStudentRepositroy,
        },
      ],
    }).compile();

    profileController = app.get<ProfileController>(ProfileController);

    const student: StudentDto =
      await profileController.createStudent(newStudent);

    expect(student).toBeDefined();
    expect(student.email).toBe(newStudent.email);
    expect(student.name).toBe(newStudent.name);
    expect(student).toHaveProperty('id');

    createdStudentId = student.id;
  });

  it('should be in the list', async () => {
    const students: StudentDto[] = await profileController.getAllStudent({
      limit: 100,
      offset: 0,
    });

    expect(Array.isArray(students)).toBe(true);

    const studentInList = students.find((s) => s.id === createdStudentId);

    expect(studentInList).toBeDefined();
    expect(studentInList?.email).toBe(newStudent.email);
    expect(studentInList?.name).toBe(newStudent.name);
  });

  it('should be updated', async () => {
    const newEmail = 'lakatos.nagy@gmail.com';
    const newName = 'Nagy Lakatos';
    const dataToUpdate: StudentDto = {
      id: createdStudentId,
      email: newEmail,
      name: newName,
    };

    const updatedStudent: StudentDto =
      await profileController.updateStudent(dataToUpdate);

    expect(updatedStudent).toBeDefined();
    expect(updatedStudent.email).toBe(newEmail);
    expect(updatedStudent.name).toBe(newName);
    expect(updatedStudent.id).toBe(createdStudentId);
  });

  it('should be deleted', async () => {
    const deletedStudentId =
      await profileController.deleteStudent(createdStudentId);
    expect(deletedStudentId).toBe(createdStudentId);
  });
});
