import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: Prisma.ProductUncheckedCreateInput, companyId: string) {
    return this.prisma.product.create({
      data: { ...createProductDto, companyId },
    });
  }

  findAll(companyId: string) {
    return this.prisma.product.findMany({ where: { companyId } });
  }
}