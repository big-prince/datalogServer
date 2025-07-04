/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatalogService } from 'src/datalog/datalog.service';
import {
  SaveTokenInterface,
  TokenPayloadInterface,
} from '../configs/interfaces/auth.interface';
import { CustomError } from 'src/common/exceptions/customError';
import * as jwt from 'jsonwebtoken';
import { allEnv } from 'src/configs/env.config';
import { LoginDto, RegisterDto } from 'src/users/dto/user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private datalogService: DatalogService,
  ) {}

  //generate Access Token
  generateToken(payload: TokenPayloadInterface): string {
    const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError('JWT secret not found', 500);
    }
    return jwt.sign(payload, secret);
  }

  //generate and save refresh token
  async saveRefreshToken(payload: SaveTokenInterface) {
    await this.datalogService.saveToken({
      userId: payload.userId,
      token: payload.token,
    });
    return {
      message: 'Refresh token saved successfully',
    };
  }

  // //verify token
  // verifyToken(token: string) {
  //   this.datalogService
  //     .verifyToken(token)
  //     .then((decoded: TokenPayloadInterface) => {
  //       return decoded;
  //     })
  //     .catch((e) => {
  //       throw new CustomError(e.message, 401);
  //     });
  // }

  //Register User
  async registerUser(data: RegisterDto): Promise<Record<string, any>> {
    const hashedPassword = await hashPassword(data.password);
    const createData = {
      ...data,
      password: hashedPassword,
    };
    const newUser = await this.datalogService.createUser(createData);

    if (!newUser) {
      throw new CustomError('User registration failed', 500);
    }
    const payload: TokenPayloadInterface = {
      sub: newUser.id.toString(),
      email: newUser.email,
    };
    const accessToken = this.generateToken(payload);
    const refreshToken = this.generateToken({
      sub: newUser.id.toString(),
      email: newUser.email,
    });

    await this.saveRefreshToken({
      userId: newUser.id.toString(),
      token: refreshToken,
    });

    const response: Record<string, any> = {
      message: 'User registered successfully',
      accessToken: accessToken,
      refreshToken: refreshToken,
      userID: newUser.id.toString(),
    };

    return response;
  }

  //login User
  async loginUser(data: LoginDto): Promise<Record<string, any>> {
    let returnModule: Record<string, any> = {};
    const user = await this.datalogService.findUserByEmail(data.email);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid password', 401);
    }

    const payload: TokenPayloadInterface = {
      sub: user.id.toString(),
      email: user.email,
    };

    const accessToken = this.generateToken(payload);

    returnModule = {
      message: 'Login successful',
      accessToken: accessToken,
      userID: user.id.toString(),
      userFullName: user.fullName,
      userEmail: user.email,
      onboarded: {
        sims: user.sims?.length > 0,
        settings: !!user.settings,
      },
    };

    return returnModule;
  }
}
