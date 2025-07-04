/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NestMiddleware } from '@nestjs/common';
import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../exceptions/customError';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const corsOptions: CorsOptions = {
      origin: ['http://localhost:5173', 'https://datalogg.netlify.app'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Custom-Header',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 200,
    };

    cors(corsOptions)(req, res, (err) => {
      if (err) {
        console.error('CORS Error:', err);
        throw new CustomError('CORS Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      next();
    });
  }
}
