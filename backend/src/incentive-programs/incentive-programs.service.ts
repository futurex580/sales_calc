import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateIncentiveProgramDto } from './dto/create-incentive-program.dto';
import { UpdateIncentiveProgramDto } from './dto/update-incentive-program.dto';

@Injectable()
export class IncentiveProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createIncentiveProgramDto: CreateIncentiveProgramDto) {
    const { productIds, ...data } = createIncentiveProgramDto;
    return this.prisma.incentiveProgram.create({
      data: {
        ...data,
        // Menyambungkan relasi many-to-many ke tabel Product
        products: productIds && productIds.length > 0 ? {
          connect: productIds.map(id => ({ id }))
        } : undefined,
      },
    });
  }

  // Di dalam fungsi findAll(), tambahkan include products agar Frontend bisa memunculkan namanya
   findAll(companyId: string) {
    return this.prisma.incentiveProgram.findMany({
      where: { companyId }, // <--- Filter Proteksi Company
      include: { 
        tiers: true,
        products: true
      },
    });
  }


  async getKpiReport(companyId: string) {
    const programs = await this.prisma.incentiveProgram.findMany({
      where: { companyId },
      include: {
        products: { select: { id: true, name: true } },
        tiers: {
          include: {
            commissionRecords: {
              select: { commissionEarned: true }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    const report = [];
    for (const p of programs) {
      const isGlobal = p.products.length === 0;
      const productIds = p.products.map(prod => prod.id);

      const salesAggr = await this.prisma.salesRecord.aggregate({
        where: {
          companyId,
          soldAt: { gte: p.startDate, lte: p.endDate },
          ...(isGlobal ? {} : { productId: { in: productIds } })
        },
        _sum: { quantity: true, totalValue: true }
      });

      let totalCommissions = 0;
      p.tiers.forEach(t => t.commissionRecords.forEach(cr => totalCommissions += Number(cr.commissionEarned)));

      report.push({
        id: p.id,
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: p.isActive,
        products: p.products.map(prod => prod.name),
        totalRevenue: Number(salesAggr._sum.totalValue || 0),
        totalQty: salesAggr._sum.quantity || 0,
        totalCommissions,
      });
    }
    return report;
  }

  findOne(id: string) {
    return this.prisma.incentiveProgram.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  update(id: string, updateIncentiveProgramDto: UpdateIncentiveProgramDto) {
    const { productIds, ...data } = updateIncentiveProgramDto;
    return this.prisma.incentiveProgram.update({
      where: { id },
      data: {
        ...data,
        // Using `set` overwrites the many-to-many relationship with the new array of IDs
        products: productIds ? { set: productIds.map(id => ({ id })) } : undefined
      },
    });
  }

  remove(id: string) {
    return this.prisma.incentiveProgram.delete({
      where: { id },
    });
  }
}