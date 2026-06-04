import { Test, TestingModule } from '@nestjs/testing';
import { CommissionRecordsService } from './commission-records.service';

describe('CommissionRecordsService', () => {
  let service: CommissionRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionRecordsService],
    }).compile();

    service = module.get<CommissionRecordsService>(CommissionRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
