/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { DataLog } from './datalog.entity';

@Entity()
export class Sim {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  nickname: string;

  @ManyToOne(() => User, (user) => user.sims, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => DataLog, (dataLog) => dataLog.sim, { cascade: true })
  dataLogs: DataLog[];
}
