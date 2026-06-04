import { Test, TestingModule } from '@nestjs/testing';
import { CommissionRecordsController } from './commission-records.controller';
import { CommissionRecordsService } from './commission-records.service';

describe('CommissionRecordsController', () => {
  let controller: CommissionRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionRecordsController],
      providers: [CommissionRecordsService],
    }).compile();

    controller = module.get<CommissionRecordsController>(CommissionRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
