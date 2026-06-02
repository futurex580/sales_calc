import { Test, TestingModule } from '@nestjs/testing';
import { SalesRecordsController } from './sales-records.controller';
import { SalesRecordsService } from './sales-records.service';

describe('SalesRecordsController', () => {
  let controller: SalesRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesRecordsController],
      providers: [SalesRecordsService],
    }).compile();

    controller = module.get<SalesRecordsController>(SalesRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
