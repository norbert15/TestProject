import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('students')
export class StudentEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
