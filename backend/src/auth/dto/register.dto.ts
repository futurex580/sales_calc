import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsEnum(['COMPANY_ADMIN', 'SALES_REP'])
  @IsOptional()
  role?: 'COMPANY_ADMIN' | 'SALES_REP';
}
