import { Test, TestingModule } from '@nestjs/testing';
import { IncentiveProgramsController } from './incentive-programs.controller';
import { IncentiveProgramsService } from './incentive-programs.service';

describe('IncentiveProgramsController', () => {
  let controller: IncentiveProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncentiveProgramsController],
      providers: [IncentiveProgramsService],
    }).compile();

    controller = module.get<IncentiveProgramsController>(IncentiveProgramsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
