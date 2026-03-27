import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyword: string;

  @Column()
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}