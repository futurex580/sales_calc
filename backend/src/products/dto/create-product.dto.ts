import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0, { message: 'Base price cannot be negative' })
  basePrice: number;

  @IsNumber()
  @Min(0, { message: 'COGS cannot be negative' })
  cogs: number;
}
