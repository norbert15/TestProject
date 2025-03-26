import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProfileService } from './profile.service';
import { CreateStudentDto, StudentDto } from '@libs/shared';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern('getStudents')
  getAllStudent(
    @Payload() opts: { limit: number; offset: number },
  ): Promise<StudentDto[]> {
    return this.profileService.findAllStudent(opts.limit, opts.offset);
  }

  @MessagePattern('createStudent')
  createStudent(@Payload() student: CreateStudentDto): Promise<StudentDto> {
    return this.profileService.createStudent(student);
  }

  @MessagePattern('updateStudent')
  updateStudent(@Payload() student: StudentDto): Promise<StudentDto> {
    return this.profileService.updateStudent(student);
  }

  @MessagePattern('deleteStudent')
  deleteStudent(@Payload() studentId: string): Promise<string> {
    return this.profileService.deleteStudentById(studentId);
  }
}
