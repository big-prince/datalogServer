/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SimsService } from './sims.service';
import {
  CreateSimDto,
  UpdateSimDto,
  CreateMultipleSimsDto,
} from './dto/sim.dto';
import { JwtAuthGuard } from '../common/guards/auth-guard';
import { CustomError } from '../common/exceptions/customError';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Controller('api/sims')
@UseGuards(JwtAuthGuard)
export class SimsController {
  constructor(private readonly simsService: SimsService) {}

  @Post()
  async createSim(
    @Body() createSimDto: CreateSimDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const sim = await this.simsService.createSim(userId, createSimDto);
      return res.status(201).json({
        message: 'SIM created successfully',
        data: sim,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('multiple')
  async createMultipleSims(
    @Body() createMultipleSimsDto: CreateMultipleSimsDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      console.log('THE DATA RECEIVED:', createMultipleSimsDto);
      console.log('THE USER ID:', req.user?.id);
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const sims = await this.simsService.createMultipleSims(
        userId,
        createMultipleSimsDto,
      );
      return res.status(201).json({
        message: `${sims.length} SIM(s) created successfully`,
        data: sims,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get()
  async getUserSims(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const sims = await this.simsService.getUserSims(userId);
      return res.status(200).json({
        message: 'SIMs retrieved successfully',
        data: sims,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get(':id')
  async getSimById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const sim = await this.simsService.getSimById(id, userId);
      return res.status(200).json({
        message: 'SIM retrieved successfully',
        data: sim,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put(':id')
  async updateSim(
    @Param('id') id: string,
    @Body() updateSimDto: UpdateSimDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const sim = await this.simsService.updateSim(id, userId, updateSimDto);
      return res.status(200).json({
        message: 'SIM updated successfully',
        data: sim,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Delete(':id')
  async deleteSim(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      await this.simsService.deleteSim(id, userId);
      return res.status(200).json({
        message: 'SIM deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Delete()
  async deleteAllUserSims(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      await this.simsService.deleteAllUserSims(userId);
      return res.status(200).json({
        message: 'All SIMs deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
