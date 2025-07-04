/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sim } from '../entities/sim.entity';
import { User } from '../entities/user.entity';
import { DatalogService } from '../datalog/datalog.service';
import {
  CreateSimDto,
  UpdateSimDto,
  CreateMultipleSimsDto,
} from './dto/sim.dto';

@Injectable()
export class SimsService {
  constructor(
    @InjectRepository(Sim)
    private simRepository: Repository<Sim>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private DatalogService: DatalogService,
  ) {}

  async createSim(userId: string, createSimDto: CreateSimDto): Promise<Sim> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sim = this.simRepository.create({
      ...createSimDto,
      nickname: createSimDto.nickname || `${createSimDto.provider} SIM`,
      user,
    });

    return await this.simRepository.save(sim);
  }

  async createMultipleSims(
    userId: string,
    createMultipleSimsDto: CreateMultipleSimsDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sims = createMultipleSimsDto.sims.map((simDto) => {
      console.log('Creating SIM:', simDto);
      const dataToSend = {
        nickname: simDto.nickname,
        provider: simDto.provider,
        phoneNumber: simDto.phoneNumber,
      };
      const createdSim = this.DatalogService.createSim(user, dataToSend);
      return createdSim;
    });

    return {
      message: 'SIMs created successfully',
      data: sims,
    };
  }

  async getUserSims(userId: string): Promise<Sim[]> {
    return await this.simRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getSimById(id: string, userId: string): Promise<Sim> {
    const sim = await this.simRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!sim) {
      throw new NotFoundException('SIM not found');
    }

    return sim;
  }

  async updateSim(
    id: string,
    userId: string,
    updateSimDto: UpdateSimDto,
  ): Promise<Sim> {
    const sim = await this.getSimById(id, userId);

    Object.assign(sim, updateSimDto);
    return await this.simRepository.save(sim);
  }

  async deleteSim(id: string, userId: string): Promise<void> {
    const sim = await this.getSimById(id, userId);
    await this.simRepository.remove(sim);
  }

  async deleteAllUserSims(userId: string): Promise<void> {
    await this.simRepository.delete({ user: { id: userId } });
  }
}
