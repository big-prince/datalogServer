/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Sim } from '../entities/sim.entity';
import { DataLog } from '../entities/datalog.entity';
import { Setting } from '../entities/setting.entity';
import { Token } from 'src/entities/token.entity';
// Custom Error
import { CustomError } from '../common/exceptions/customError';
// Interfaces
import {
  SaveTokenInterface,
  TokenPayloadInterface,
} from '../configs/interfaces/auth.interface';
import { allEnv } from 'src/configs/env.config';
import * as jwt from 'jsonwebtoken';
import { UserBase } from 'src/configs/interfaces/user.interface';

@Injectable()
export class DatalogService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Sim) private simRepository: Repository<Sim>,
    @InjectRepository(DataLog) private dataLogRepository: Repository<DataLog>,
    @InjectRepository(Setting) private settingRepository: Repository<Setting>,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {}

  async createUser(data: UserBase) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new CustomError('User already exists', 400);
      } else {
        // console.log('Creating new user:', data);
      }
      const user = this.userRepository.create(data);
      const savedUser = await this.userRepository.save(user);

      return savedUser;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      // Log the error for debugging purposes
      console.error('Error creating user:', error);
      throw new CustomError('Failed to create user.', 500);
    }
  }

  async findUserById(userId: string, relations: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: relations ? ['sims', 'settings'] : [],
    });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['sims', 'settings'],
    });
    return user;
  }

  async createDataLog(data: {
    userId: string;
    simId: string;
    source: string;
    dataSize: number;
    price: number;
    validityDays: number;
    purchaseDate: Date;
    expiryDate?: Date;
  }) {
    const dataLog = this.dataLogRepository.create({
      ...data,
      user: { id: data.userId },
      sim: { id: data.simId },
    });
    return this.dataLogRepository.save(dataLog);
  }

  // Save token to database and generate a new one if needed
  async saveToken(payload: SaveTokenInterface): Promise<Token> {
    const userId: string = payload.userId;
    const user = await this.findUserById(userId, false);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const existingToken = await this.tokenRepository.findOne({
      where: { userId: userId },
    });

    if (existingToken && existingToken.expiresAt > new Date()) {
      return existingToken;
    }

    const tokenPayload: TokenPayloadInterface = {
      sub: userId,
      email: user.email,
    };

    const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError('JWT secret not found', 500);
    }
    const token = jwt.sign(tokenPayload, secret);
    const expiresAt = new Date(Date.now() + 10800000);
    const newToken = this.tokenRepository.create({
      token,
      expiresAt,
      userId,
      user,
      isRevoked: false,
    });
    const saveToken = await this.tokenRepository
      .save(newToken)
      .catch((error) => {
        console.error('Error saving token:', error);
        throw new CustomError('Failed to save token', 500);
      });
    return saveToken;
  }

  // verifyToken(token: string): Promise<TokenPayloadInterface> {
  //   try {
  //     const decoded = this.jwtService.verify<TokenPayloadInterface>(token);
  //     return Promise.resolve(decoded);
  //   } catch (error) {
  //     throw new CustomError(error.message, 401);
  //   }
  // }

  //SIMS
  async createSim(user: User, simData: Partial<Sim>): Promise<Sim> {
    try {
      const sim = this.simRepository.create({
        ...simData,
        user,
        nickname: simData.nickname || `${simData.provider} SIM`,
      });
      return await this.simRepository.save(sim);
    } catch (error) {
      console.error('Error creating SIM:', error);
      throw new CustomError('Failed to create SIM', 500);
    }
  }

  // SETTINGS
  async createSetting(
    user: User,
    settingData: Partial<Setting>,
  ): Promise<Setting> {
    try {
      const setting = this.settingRepository.create({
        ...settingData,
        user,
      });
      return await this.settingRepository.save(setting);
    } catch (error) {
      console.error('Error creating setting:', error);
      throw new CustomError('Failed to create setting', 500);
    }
  }
}
