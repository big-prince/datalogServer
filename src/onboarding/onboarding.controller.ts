import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SimsService } from '../sims/sims.service';
import { SettingsService } from '../settings/settings.service';
import { CreateSimDto } from '../sims/dto/sim.dto';
import { CreateSettingDto } from '../settings/dto/setting.dto';
import { JwtAuthGuard } from '../common/guards/auth-guard';
import { CustomError } from '../common/exceptions/customError';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class CompleteOnboardingDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSimDto)
  sims?: CreateSimDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSettingDto)
  settings?: CreateSettingDto;
}

@Controller('api/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private readonly simsService: SimsService,
    private readonly settingsService: SettingsService,
  ) {}

  @Post('complete')
  async completeOnboarding(
    @Body() onboardingDto: CompleteOnboardingDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const results: any = {};

      // Create SIMs if provided
      if (onboardingDto.sims && onboardingDto.sims.length > 0) {
        const createMultipleSimsDto = { sims: onboardingDto.sims };
        results.sims = await this.simsService.createMultipleSims(userId, createMultipleSimsDto);
      }

      // Create/Update settings if provided
      if (onboardingDto.settings) {
        results.settings = await this.settingsService.createOrUpdateUserSettings(
          userId,
          onboardingDto.settings,
        );
      }

      return res.status(201).json({
        message: 'Onboarding completed successfully',
        data: results,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('sims')
  async saveSims(
    @Body() simsDto: { sims: CreateSimDto[] },
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!simsDto.sims || simsDto.sims.length === 0) {
        return res.status(200).json({
          message: 'No SIMs provided to save',
          data: [],
        });
      }

      const sims = await this.simsService.createMultipleSims(userId, simsDto);
      return res.status(201).json({
        message: `${sims.length} SIM(s) saved successfully during onboarding`,
        data: sims,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('settings')
  async saveSettings(
    @Body() settingsDto: CreateSettingDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const settings = await this.settingsService.createOrUpdateUserSettings(userId, settingsDto);
      return res.status(201).json({
        message: 'Settings saved successfully during onboarding',
        data: settings,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

