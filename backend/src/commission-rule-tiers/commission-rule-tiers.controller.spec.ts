import { Test, TestingModule } from '@nestjs/testing';
import { CommissionRuleTiersController } from './commission-rule-tiers.controller';
import { CommissionRuleTiersService } from './commission-rule-tiers.service';

describe('CommissionRuleTiersController', () => {
  let controller: CommissionRuleTiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionRuleTiersController],
      providers: [CommissionRuleTiersService],
    }).compile();

    controller = module.get<CommissionRuleTiersController>(CommissionRuleTiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
