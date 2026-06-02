import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionRuleTierDto } from './create-commission-rule-tier.dto';

export class UpdateCommissionRuleTierDto extends PartialType(CreateCommissionRuleTierDto) {}
