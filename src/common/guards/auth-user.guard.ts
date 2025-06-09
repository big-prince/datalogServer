/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CustomError } from '../exceptions/customError';

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Assuming request.user is set by JwtStrategy

    if (!userId) {
      throw new CustomError('Unauthorized', 401);
    }

    const dbUser = await this.userRepository.findOne({
      where: { id: userId as string },
    });

    if (!dbUser) {
      throw new CustomError('Unauthorized: User not in Database Records!', 401);
    }

    request.userDetails = dbUser;

    return true;
  }
}
