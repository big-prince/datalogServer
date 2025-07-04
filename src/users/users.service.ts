/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DatalogService } from '../datalog/datalog.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomError } from '../common/exceptions/customError';

@Injectable()
export class UsersService {
  constructor(
    private DatalogService: DatalogService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getMe(userId: string): Promise<any> {
    const user = await this.DatalogService.findUserById(userId, true);
    if (!user) {
      throw new Error('User not found');
    }
    //remove password and other sensitive fields
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Check if email is already taken by another user
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new CustomError('Email already in use', 400);
      }
    }

    // Update user fields
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}
