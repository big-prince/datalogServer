/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';

@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Get()
  async getUserPreferences(@Req() req: any) {
    const userId = req.user.id;
    return await this.userPreferenceService.getUserPreferences(userId);
  }

  @Post('purchase-preferences')
  async updatePurchasePreferences(@Req() req: any, @Body() preferences: any) {
    const userId = req.user.id;
    return await this.userPreferenceService.updatePurchasePreferences(
      userId,
      preferences,
    );
  }

  @Post('ai-settings')
  async updateAISettings(@Req() req: any, @Body() aiSettings: any) {
    const userId = req.user.id;
    return await this.userPreferenceService.updateAISettings(
      userId,
      aiSettings,
    );
  }

  @Put('onboarding-complete')
  async markOnboardingComplete(@Req() req: any) {
    const userId = req.user.id;
    return await this.userPreferenceService.markOnboardingComplete(userId);
  }

  @Post()
  async createOrUpdatePreferences(@Req() req: any, @Body() preferences: any) {
    const userId = req.user.id;
    return await this.userPreferenceService.createOrUpdatePreferences(
      userId,
      preferences,
    );
  }
}
