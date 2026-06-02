import { Test, TestingModule } from '@nestjs/testing';
import { IncentiveProgramsService } from './incentive-programs.service';

describe('IncentiveProgramsService', () => {
  let service: IncentiveProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncentiveProgramsService],
    }).compile();

    service = module.get<IncentiveProgramsService>(IncentiveProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
