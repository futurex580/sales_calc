import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalesRecordDto: Prisma.SalesRecordUncheckedCreateInput) {
    // 1. Fetch the product to get its true basePrice
    const product = await this.prisma.product.findUnique({
      where: { id: createSalesRecordDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Securely calculate the total value on the backend
    const calculatedTotalValue = Number(product.basePrice) * createSalesRecordDto.quantity;

    return this.prisma.salesRecord.create({
      data: {
        ...createSalesRecordDto,
        totalValue: calculatedTotalValue,
      },
    });
  }

  findAll() {
    return this.prisma.salesRecord.findMany({
      include: {
        // Automatically fetch related user and product details!
        user: { select: { name: true, email: true } },
        product: { select: { name: true, basePrice: true } }
      },
    });
  }

  findOne(id: string) {
    return this.prisma.salesRecord.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, basePrice: true } }
      },
    });
  }

  update(id: string, updateSalesRecordDto: Prisma.SalesRecordUncheckedUpdateInput) {
    return this.prisma.salesRecord.update({
      where: { id },
      data: updateSalesRecordDto,
    });
  }

  remove(id: string) {
    return this.prisma.salesRecord.delete({
      where: { id },
    });
  }
}
