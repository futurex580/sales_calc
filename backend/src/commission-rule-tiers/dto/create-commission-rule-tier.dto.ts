import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { TierBasis, RewardType } from '@prisma/client';

export class CreateCommissionRuleTierDto {
  @IsString()
  @IsNotEmpty()
  incentiveProgramId: string;

  @IsNumber()
  @Min(0)
  minTarget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTarget?: number;

  @IsEnum(TierBasis)
  @IsOptional()
  tierBasis?: TierBasis;

  @IsEnum(RewardType)
  @IsOptional()
  rewardType?: RewardType;

  @IsNumber()
  @Min(0)
  rewardValue: number;
}
