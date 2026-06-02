import { PartialType } from '@nestjs/mapped-types';
import { CreateIncentiveProgramDto } from './create-incentive-program.dto';

export class UpdateIncentiveProgramDto extends PartialType(CreateIncentiveProgramDto) {}
