import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
import { User } from '../entities/user.entity';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrUpdateUserSettings(userId: string, createSettingDto: CreateSettingDto): Promise<Setting> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['settings'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let setting = user.settings;
    
    if (setting) {
      // Update existing settings
      Object.assign(setting, createSettingDto);
    } else {
      // Create new settings
      setting = this.settingRepository.create({
        ...createSettingDto,
        user,
      });
    }

    return await this.settingRepository.save(setting);
  }

  async getUserSettings(userId: string): Promise<Setting | null> {
    const setting = await this.settingRepository.findOne({
      where: { user: { id: userId } },
    });
    
    return setting;
  }

  async updateUserSettings(userId: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    let setting = await this.getUserSettings(userId);
    
    if (!setting) {
      // If no settings exist, create them
      return this.createOrUpdateUserSettings(userId, updateSettingDto);
    }

    Object.assign(setting, updateSettingDto);
    return await this.settingRepository.save(setting);
  }

  async deleteUserSettings(userId: string): Promise<void> {
    const setting = await this.getUserSettings(userId);
    
    if (setting) {
      await this.settingRepository.remove(setting);
    }
  }
}

