/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sim } from './sim.entity';
import { DataLog } from './datalog.entity';
import { Setting } from './setting.entity';
import { UserPreference } from './user-preference.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Sim, (sim) => sim.user, { cascade: true })
  sims: Sim[];

  @OneToMany(() => DataLog, (dataLog) => dataLog.user, { cascade: true })
  dataLogs: DataLog[];

  @OneToOne(() => Setting, (setting) => setting.user, { cascade: true })
  settings: Setting;

  @OneToOne(() => UserPreference, { cascade: true })
  preferences: UserPreference;
}
