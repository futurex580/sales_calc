import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionRecordDto } from './create-commission-record.dto';

export class UpdateCommissionRecordDto extends PartialType(CreateCommissionRecordDto) {}
