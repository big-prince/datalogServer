/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('float', { nullable: true })
  dailyDataUsage: number;

  @Column('json', { nullable: true })
  notificationPrefs: any;

  @ManyToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  user: User;
}
