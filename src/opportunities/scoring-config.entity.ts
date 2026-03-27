import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ScoringConfig {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 1 })
  trendWeight: number;

  @Column({ type: 'float', default: 1 })
  demandWeight: number;

  @Column({ type: 'float', default: 1 })
  competitionWeight: number;

  @Column({ type: 'float', default: 1 })
  marginWeight: number;

  @Column({ type: 'float', default: 70 })
  highThreshold: number;

  @Column({ type: 'float', default: 40 })
  testThreshold: number;
}