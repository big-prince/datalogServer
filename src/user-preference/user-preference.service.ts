/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../entities/user-preference.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepository: Repository<UserPreference>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createOrUpdatePreferences(
    userId: string,
    preferences: Partial<UserPreference>,
  ): Promise<UserPreference> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let userPreference = await this.userPreferenceRepository.findOne({
      where: { user: { id: userId } },
    });

    if (userPreference) {
      // Update existing preferences
      Object.assign(userPreference, preferences);
      return await this.userPreferenceRepository.save(userPreference);
    } else {
      // Create new preferences
      userPreference = this.userPreferenceRepository.create({
        ...preferences,
        user,
      });
      return await this.userPreferenceRepository.save(userPreference);
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    return await this.userPreferenceRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async updateAISettings(
    userId: string,
    aiSettings: any,
  ): Promise<UserPreference> {
    let userPreference = await this.getUserPreferences(userId);

    if (!userPreference) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      userPreference = this.userPreferenceRepository.create({
        user,
        aiSettings,
      });
    } else {
      userPreference.aiSettings = {
        ...userPreference.aiSettings,
        ...aiSettings,
      };
    }

    return await this.userPreferenceRepository.save(userPreference);
  }

  async updatePurchasePreferences(
    userId: string,
    purchasePreferences: any,
  ): Promise<UserPreference> {
    let userPreference = await this.getUserPreferences(userId);

    if (!userPreference) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      userPreference = this.userPreferenceRepository.create({
        user,
        purchasePreferences,
      });
    } else {
      userPreference.purchasePreferences = purchasePreferences;
    }

    return await this.userPreferenceRepository.save(userPreference);
  }

  async markOnboardingComplete(userId: string): Promise<UserPreference> {
    return await this.createOrUpdatePreferences(userId, {
      onboardingCompleted: true,
    });
  }
}
