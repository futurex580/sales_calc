import { Test, TestingModule } from '@nestjs/testing';
import { CommissionRuleTiersService } from './commission-rule-tiers.service';

describe('CommissionRuleTiersService', () => {
  let service: CommissionRuleTiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionRuleTiersService],
    }).compile();

    service = module.get<CommissionRuleTiersService>(CommissionRuleTiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
