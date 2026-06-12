import { IsInt, IsNotEmpty, IsOptional, IsString, Min, IsDateString } from 'class-validator';

export class CreateSalesRecordDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsDateString()
  soldAt?: string;
}
