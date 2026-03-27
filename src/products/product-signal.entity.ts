import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductSignal {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'float', nullable: true })
  trendScore: number;

  @Column({ type: 'float', nullable: true })
  demandScore: number;

  @Column({ type: 'float', nullable: true })
  competitionScore: number;

  @Column({ type: 'float', nullable: true })
  marginScore: number;

  @CreateDateColumn()
  createdAt: Date;
}