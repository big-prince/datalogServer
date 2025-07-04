/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';

interface NotificationSettings {
  expiryReminders: boolean;
  highUsageWarnings: boolean;
  usageSummaries: boolean;
}

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dailyUsageEstimate: number;

  @Column({ type: 'enum', enum: ['GB', 'MB'], default: 'GB' })
  usageUnit: 'GB' | 'MB';

  @Column({ type: 'enum', enum: ['GB', 'MB'], default: 'GB' })
  preferredDisplayUnit: 'GB' | 'MB';

  @Column('json', {
    default: {
      expiryReminders: true,
      highUsageWarnings: false,
      usageSummaries: false,
    },
  })
  notifications: NotificationSettings;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
