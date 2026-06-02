import { Test, TestingModule } from '@nestjs/testing';
import { SalesRecordsService } from './sales-records.service';

describe('SalesRecordsService', () => {
  let service: SalesRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesRecordsService],
    }).compile();

    service = module.get<SalesRecordsService>(SalesRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
