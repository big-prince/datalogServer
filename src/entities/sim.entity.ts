/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DataLog } from './datalog.entity';

@Entity()
export class Sim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  nickname: string;

  @Column()
  provider: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.sims, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => DataLog, (dataLog) => dataLog.sim, { cascade: true })
  dataLogs: DataLog[];
}
