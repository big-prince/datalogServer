import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../common/guards/auth-guard';
import { CustomError } from '../common/exceptions/customError';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  async createOrUpdateSettings(
    @Body() createSettingDto: CreateSettingDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const setting = await this.settingsService.createOrUpdateUserSettings(userId, createSettingDto);
      return res.status(201).json({
        message: 'Settings saved successfully',
        data: setting,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get()
  async getUserSettings(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const settings = await this.settingsService.getUserSettings(userId);
      
      if (!settings) {
        return res.status(200).json({
          message: 'No settings found for user',
          data: null,
        });
      }

      return res.status(200).json({
        message: 'Settings retrieved successfully',
        data: settings,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put()
  async updateUserSettings(
    @Body() updateSettingDto: UpdateSettingDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const setting = await this.settingsService.updateUserSettings(userId, updateSettingDto);
      return res.status(200).json({
        message: 'Settings updated successfully',
        data: setting,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Delete()
  async deleteUserSettings(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      await this.settingsService.deleteUserSettings(userId);
      return res.status(200).json({
        message: 'Settings deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

