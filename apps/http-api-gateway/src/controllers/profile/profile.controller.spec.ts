import { ProfileController } from './profile.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { CreateStudentDto, StudentDto } from '@libs/shared';
import { randomUUID } from 'crypto';

describe('ProfileController', () => {
  let profileController: ProfileController;
  let clientProxyMock: Partial<ClientProxy>;
  const students: StudentDto[] = [
    { id: '1', email: 'test@test.com', name: 'Test Elek' },
  ];

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn((pattern, data: any): Observable<any> => {
        if (pattern === 'getStudents') {
          return of(students);
        }

        if (pattern === 'createStudent') {
          const createdStudent = { ...data, id: randomUUID() };
          students.push(createdStudent);
          return of(createdStudent);
        }

        if (pattern === 'updateStudent') {
          const studentIndex = students.findIndex((s) => s.id === data.id);

          if (studentIndex !== -1) {
            students[studentIndex] = data;
          } else {
            return of(null);
          }

          return of(data);
        }

        if (pattern === 'deleteStudent') {
          const studentIndex = students.findIndex((s) => s.id === data);

          if (studentIndex !== -1) {
            students.splice(studentIndex, 1);
          } else {
            return of(null);
          }

          return of(data);
        }

        return of(null);
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: 'NATS_SERVER', useValue: clientProxyMock }],
    }).compile();

    profileController = app.get<ProfileController>(ProfileController);
  });

  it('should return a list of students', async () => {
    const result = await profileController.getAllStudents(100, 0);

    expect(result).toEqual(students);
    expect(clientProxyMock.send).toHaveBeenCalledWith('getStudents', {
      limit: 100,
      offset: 0,
    });
  });

  it('should create a student', async () => {
    const student: CreateStudentDto = {
      email: 'test@test.com',
      name: 'Nagy Test',
    };
    const createdStudent = await profileController.createStudent(student);

    expect(createdStudent.email).toBe(student.email);
    expect(createdStudent.name).toBe(student.name);
    expect(createdStudent).toHaveProperty('id');
    expect(clientProxyMock.send).toHaveBeenCalledWith('createStudent', student);
  });

  it('should update a student', async () => {
    const student: StudentDto = {
      email: 'test@test.com',
      name: 'Nagy Test',
      id: students[0].id,
    };
    const updatedStudent = await profileController.updateStudent(student);

    expect(updatedStudent.email).toBe(student.email);
    expect(updatedStudent.name).toBe(student.name);
    expect(updatedStudent.id).toBe(student.id);
    expect(clientProxyMock.send).toHaveBeenCalledWith('updateStudent', student);
  });

  it('should delete a student', async () => {
    const studentId = students[0].id;
    const deletedId = await profileController.deleteStudent(studentId);

    expect(deletedId).toBe(studentId);
    expect(clientProxyMock.send).toHaveBeenCalledWith(
      'deleteStudent',
      studentId,
    );
  });
});
