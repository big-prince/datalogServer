/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/users/dto/user.dto';
import { CustomError } from 'src/common/exceptions/customError';
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      if (!registerDto || !registerDto.email || !registerDto.password) {
        throw new CustomError('Invalid registration data', 400);
      }
      const result = await this.authService.registerUser(registerDto);
      if (!result) {
        throw new CustomError(
          'Registration Diddnt return a valid response',
          400,
        );
      }

      //set tokens in cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });

      delete result.refreshToken;

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      if (!loginDto || !loginDto.email || !loginDto.password) {
        throw new CustomError('Invalid login data', 400);
      }
      const result = await this.authService.loginUser(loginDto);
      if (!result) {
        throw new CustomError('Login failed', 401);
      }

      //set tokens in cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });

      delete result.refreshToken;

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
