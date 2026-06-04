import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateIncentiveProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  // Add this field so NestJS allows it to pass through to Prisma!
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
}
