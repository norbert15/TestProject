import { CreateStudentDto, StudentDto } from '@libs/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('students')
export class ProfileController {
  constructor(
    @Inject('NATS_SERVER') private readonly natsServer: ClientProxy,
  ) {}

  @Get('list')
  getAllStudents(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ): Promise<StudentDto[]> {
    return firstValueFrom(
      this.natsServer.send('getStudents', { limit, offset }),
    );
  }

  @Post('create')
  createStudent(@Body() student: CreateStudentDto): Promise<StudentDto> {
    return firstValueFrom(this.natsServer.send('createStudent', student));
  }

  @Put('update')
  updateStudent(@Body() student: StudentDto): Promise<StudentDto> {
    return firstValueFrom(this.natsServer.send('updateStudent', student));
  }

  @Delete('delete/:id')
  deleteStudent(@Param('id', ParseUUIDPipe) uuid: string): Promise<string> {
    return firstValueFrom(this.natsServer.send('deleteStudent', uuid));
  }
}
