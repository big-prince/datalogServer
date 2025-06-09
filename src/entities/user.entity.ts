/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Sim } from './sim.entity';
import { DataLog } from './datalog.entity';
import { Setting } from './setting.entity';

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

  @OneToMany(() => Sim, (sim) => sim.user, { cascade: true })
  sims: Sim[];

  @OneToMany(() => DataLog, (dataLog) => dataLog.user, { cascade: true })
  dataLogs: DataLog[];

  @OneToMany(() => Setting, (setting) => setting.user, { cascade: true })
  settings: Setting[];
}
