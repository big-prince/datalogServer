import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  Param,
  Put,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/auth-guard';
import { CustomError } from '../common/exceptions/customError';
import { CreateDataLogDto } from './dto/analytics.dto';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardAnalytics(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const analytics =
        await this.analyticsService.getDashboardAnalytics(userId);
      return res.status(200).json({
        message: 'Dashboard analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('usage-trends')
  async getUsageTrends(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Query('simId') simId?: string,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const trends = await this.analyticsService.getUsageTrends(
        userId,
        period,
        simId,
      );
      return res.status(200).json({
        message: 'Usage trends retrieved successfully',
        data: trends,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('spending-analysis')
  async getSpendingAnalysis(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const analysis = await this.analyticsService.getSpendingAnalysis(
        userId,
        period,
      );
      return res.status(200).json({
        message: 'Spending analysis retrieved successfully',
        data: analysis,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('provider-comparison')
  async getProviderComparison(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const comparison =
        await this.analyticsService.getProviderComparison(userId);
      return res.status(200).json({
        message: 'Provider comparison retrieved successfully',
        data: comparison,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('data-log')
  async createDataLog(
    @Body() createDataLogDto: CreateDataLogDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const dataLog = await this.analyticsService.createDataLog(
        userId,
        createDataLogDto,
      );
      return res.status(201).json({
        message: 'Data log created successfully',
        data: dataLog,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('data-logs')
  async getAllDataLogs(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('simId') simId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const dataLogs = await this.analyticsService.getAllDataLogs(
        userId,
        page,
        limit,
        simId,
        startDate,
        endDate,
      );
      return res.status(200).json({
        message: 'Data logs retrieved successfully',
        data: dataLogs,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('predictions')
  async getUsagePredictions(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('simId') simId?: string,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const predictions = await this.analyticsService.getUsagePredictions(
        userId,
        simId,
      );
      return res.status(200).json({
        message: 'Usage predictions retrieved successfully',
        data: predictions,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('active-data-logs')
  async getActiveDataLogs(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const activeDataLogs =
        await this.analyticsService.getActiveDataLogs(userId);
      return res.status(200).json({
        message: 'Active data logs retrieved successfully',
        data: activeDataLogs,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put('data-log/:id/mark-finished')
  async markDataLogAsFinished(
    @Param('id') dataLogId: string,
    @Body('actualFinishDate') actualFinishDate: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const result = await this.analyticsService.markDataLogAsFinished(
        userId,
        dataLogId,
        new Date(actualFinishDate),
      );
      if (!result) {
        throw new CustomError('Data log not found or already finished', 404);
      }
      console.log('Data log marked as finished:', result);

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put('data-log/:id')
  async updateDataLog(
    @Param('id') dataLogId: string,
    @Body() updateData: any,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const result = await this.analyticsService.updateDataLog(
        userId,
        dataLogId,
        updateData,
      );

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
