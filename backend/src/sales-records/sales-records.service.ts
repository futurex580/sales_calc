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

  async calculateCommission(id: string) {
    // 1. Fetch the specific sales record
    const salesRecord = await this.prisma.salesRecord.findUnique({
      where: { id },
    });

    if (!salesRecord) {
      throw new NotFoundException('Sales record not found');
    }

    // 2. Find an active incentive program that covers the date of the sale
    const activeProgram = await this.prisma.incentiveProgram.findFirst({
      where: {
        companyId: salesRecord.companyId,
        startDate: { lte: salesRecord.soldAt },
        endDate: { gte: salesRecord.soldAt },
      },
      include: { tiers: true },
    });

    if (!activeProgram) {
      return { message: 'No active incentive program found for this date.', commissionEarned: 0 };
    }

    // 3. Find the matching commission tier based on quantity sold
    const matchingTier = activeProgram.tiers.find((tier) => {
      const min = Number(tier.minQuantity);
      const max = tier.maxQuantity ? Number(tier.maxQuantity) : Infinity;
      return salesRecord.quantity >= min && salesRecord.quantity <= max;
    });

    if (!matchingTier) {
      return { message: 'No matching commission tier found for this quantity.', commissionEarned: 0 };
    }

    // 4. Do the math securely on the backend!
    const commissionPercent = Number(matchingTier.commissionPercent);
    const commissionEarned = (Number(salesRecord.totalValue) * commissionPercent) / 100;

    // 5. Save the payout to the database
    // We use `upsert` so if you recalculate later, it safely updates the existing record!
    const commissionRecord = await this.prisma.commissionRecord.upsert({
      where: { salesRecordId: salesRecord.id },
      create: {
        companyId: salesRecord.companyId,
        salesRecordId: salesRecord.id,
        tierId: matchingTier.id,
        commissionPercent: commissionPercent,
        commissionEarned: commissionEarned,
      },
      update: {
        tierId: matchingTier.id,
        commissionPercent: commissionPercent,
        commissionEarned: commissionEarned,
      },
    });

    // Return a neat summary payload
    return {
      salesRecordId: salesRecord.id,
      commissionRecordId: commissionRecord.id,
      totalValue: salesRecord.totalValue,
      programName: activeProgram.name,
      commissionPercent: commissionPercent,
      commissionEarned: commissionEarned.toFixed(2), // Format as a neat currency string
    };
  }
}
