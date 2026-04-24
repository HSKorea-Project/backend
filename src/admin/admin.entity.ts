import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50, nullable: false })
  adminId: string;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}