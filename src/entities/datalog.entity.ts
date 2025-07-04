import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Sim } from './sim.entity';

@Entity()
export class DataLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string;

  @Column('float')
  dataSize: number;

  @Column('float')
  price: number;

  @Column()
  validityDays: number;

  @Column()
  purchaseDate: Date;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  actualFinishDate: Date;

  @Column({ default: false })
  isFinished: boolean;

  @ManyToOne(() => User, (user) => user.dataLogs, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Sim, (sim) => sim.dataLogs, { onDelete: 'CASCADE' })
  sim: Sim;
}
