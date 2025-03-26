import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('addresses')
export class AddressEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;
}
