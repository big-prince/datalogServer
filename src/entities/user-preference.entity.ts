import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

interface PurchasePreferences {
  primaryMethods: string[];
  budgetRange: string;
  purchaseFrequency: string;
  preferredChannels: string[];
  autoRenewal: boolean;
  reminderDays: number;
}

interface AISettings {
  budgetAlert?: string;
  budgetAlertEnabled?: boolean;
  autoRecharge?: boolean;
  autoRechargeThreshold?: string;
  nightPlanReminder?: boolean;
  locationOptimizer?: boolean;
  smartRecommendations?: boolean;
  usagePatternAnalysis?: boolean;
}

@Entity()
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json', { nullable: true })
  purchasePreferences: PurchasePreferences;

  @Column('json', { nullable: true })
  aiSettings: AISettings;

  @Column('json', { nullable: true })
  customInsights: any[];

  @Column({ default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
