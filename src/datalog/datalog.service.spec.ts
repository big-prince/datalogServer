import { Test, TestingModule } from '@nestjs/testing';
import { DatalogService } from './datalog.service';

describe('DatalogService', () => {
  let service: DatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatalogService],
    }).compile();

    service = module.get<DatalogService>(DatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
