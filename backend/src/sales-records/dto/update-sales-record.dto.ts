import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesRecordDto } from './create-sales-record.dto';

export class UpdateSalesRecordDto extends PartialType(CreateSalesRecordDto) {}
