import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalesRecordDto: Prisma.SalesRecordUncheckedCreateInput, userId: string, companyId: string) {
    // 1. Fetch the product to get its true basePrice
    const product = await this.prisma.product.findUnique({
      where: { id: createSalesRecordDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Securely calculate the total value on the backend
    const calculatedTotalValue = Number(product.basePrice) * createSalesRecordDto.quantity;

    const salesRecord = await this.prisma.salesRecord.create({
      data: {
        ...createSalesRecordDto,
        userId: userId,       // Enforce the secure userId from the JWT!
        companyId: companyId, // Enforce the secure companyId from the JWT!
        totalValue: calculatedTotalValue,
      },
    });

    // 3. Run the V2 calculation engine!
    const result = await this.calculateCommission(salesRecord.id);

    return {
      salesRecord,
      payout: result,
    };
  }

  findAll(user: { userId: string, companyId: string, role: 'COMPANY_ADMIN' | 'SALES_REP' }) {
    const whereClause: Prisma.SalesRecordWhereInput = {
      companyId: user.companyId, // Always scope all queries by the user's company
    };

    // If the user is a sales rep, they should only see their own records.
    if (user.role === 'SALES_REP') {
      whereClause.userId = user.userId;
    }

    return this.prisma.salesRecord.findMany({
      where: whereClause,
      include: {
        // Automatically fetch related user and product details!
        user: { select: { name: true, email: true } },
        product: { select: { name: true, basePrice: true } },
        commissionRecords: true
      },
      orderBy: {
        soldAt: 'desc',
      }
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

  async remove(id: string) {
    // 1. Delete associated commission records first to satisfy foreign key constraints.
    // We use deleteMany so it doesn't throw an error if a commission record was never generated.
    await this.prisma.commissionRecord.deleteMany({
      where: { salesRecordId: id }
    });

    // 2. Now it is safe to delete the parent sales record
    return this.prisma.salesRecord.delete({
      where: { id },
    });
  }

  async calculateCommission(id: string) {
    // 1. Fetch the specific sales record
    const salesRecord = await this.prisma.salesRecord.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!salesRecord) {
      throw new NotFoundException('Sales record not found');
    }

    // 2. Fetch total quantity sold for this product by this user (All Time)
    const totalProductSales = await this.prisma.salesRecord.aggregate({
      where: {
        userId: salesRecord.userId,
        productId: salesRecord.productId,
      },
      _sum: {
        quantity: true
      }
    });
    const totalQuantitySold = totalProductSales._sum.quantity || 0;

    // 3. Delete existing commission records if recalculating
    await this.prisma.commissionRecord.deleteMany({
      where: { salesRecordId: salesRecord.id }
    });

    // 3. Find ALL programs covering this product (ignoring dates first for better user feedback)
    // AND either apply to ALL products (products is empty) OR apply to this specific product.
    const allMatchingPrograms = await this.prisma.incentiveProgram.findMany({
      where: {
        companyId: salesRecord.companyId,
        OR: [
          { products: { some: { id: salesRecord.productId } } },
          { products: { none: {} } } // Global program
        ]
      },
      include: { 
        tiers: true,
        products: { select: { id: true } }
      },
    });

    if (allMatchingPrograms.length === 0) {
      return { 
        salesRepName: salesRecord.user.name,
        totalQuantitySold,
        totalValue: salesRecord.totalValue,
        message: 'No incentive programs are assigned to this product.', 
        payouts: [] 
      };
    }

    const soldAtTime = salesRecord.soldAt.getTime();
    const activePrograms = allMatchingPrograms.filter(p => 
      p.startDate.getTime() <= soldAtTime && p.endDate.getTime() >= soldAtTime
    );

    if (activePrograms.length === 0) {
      const programDates = allMatchingPrograms
        .map(p => `'${p.name}' (${p.startDate.toISOString().split('T')[0]} to ${p.endDate.toISOString().split('T')[0]})`)
        .join(', ');

      return { 
        salesRepName: salesRecord.user.name,
        totalQuantitySold,
        totalValue: salesRecord.totalValue,
        message: `Programs exist for this product, but the sale date is outside their active periods. Available: ${programDates}.`, 
        payouts: [] 
      };
    }

    const generatedPayouts = [];

    for (const program of activePrograms) {
      // 1. Hitung Akumulasi Penjualan Sales Rep ini selama program berlangsung!
      const isGlobal = program.products.length === 0;
      const productIds = program.products.map(p => p.id);

      const accumulatedSales = await this.prisma.salesRecord.aggregate({
        where: {
          userId: salesRecord.userId,
          companyId: salesRecord.companyId,
          soldAt: {
            gte: program.startDate,
            lte: salesRecord.soldAt,
          },
          ...(isGlobal ? {} : { productId: { in: productIds } })
        },
        _sum: {
          quantity: true,
          totalValue: true
        }
      });

      const totalQty = accumulatedSales._sum.quantity || 0;
      const totalRev = Number(accumulatedSales._sum.totalValue || 0);

      // Group tiers by Basis so they don't block each other
      const qtyTiers = program.tiers.filter(t => t.tierBasis === 'QUANTITY').sort((a, b) => Number(b.minTarget) - Number(a.minTarget));
      const revTiers = program.tiers.filter(t => t.tierBasis === 'REVENUE').sort((a, b) => Number(b.minTarget) - Number(a.minTarget));

      const matchedTiers = [];

      const matchingQtyTier = qtyTiers.find((tier) => {
        const min = Number(tier.minTarget);
        const max = tier.maxTarget ? Number(tier.maxTarget) : Infinity;
        return totalQty >= min && totalQty <= max;
      });
      if (matchingQtyTier) matchedTiers.push(matchingQtyTier);

      const matchingRevTier = revTiers.find((tier) => {
        const min = Number(tier.minTarget);
        const max = tier.maxTarget ? Number(tier.maxTarget) : Infinity;
        return totalRev >= min && totalRev <= max;
      });
      if (matchingRevTier) matchedTiers.push(matchingRevTier);

      for (const matchingTier of matchedTiers) {
        const rewardVal = Number(matchingTier.rewardValue);
        let commissionEarned = 0;

        if (program.calculationMethod === 'RETROACTIVE') {
          // RETROACTIVE: Hitung seluruh komisi yang di-HUTANG-kan, lalu kurangi dengan yang sudah pernah DIBAYARKAN
          let totalCommissionOwed = 0;
          if (matchingTier.rewardType === 'PERCENTAGE') {
            totalCommissionOwed = (totalRev * rewardVal) / 100;
          } else {
            totalCommissionOwed = totalQty * rewardVal;
          }

          const previousPayouts = await this.prisma.commissionRecord.aggregate({
            where: {
              salesRecordId: { not: salesRecord.id },
              salesRecord: {
                userId: salesRecord.userId,
                soldAt: {
                  gte: program.startDate,
                  lte: salesRecord.soldAt,
                }
              },
              tier: {
                incentiveProgramId: program.id,
                tierBasis: matchingTier.tierBasis
              }
            },
            _sum: {
              commissionEarned: true
            }
          });

          const alreadyPaid = Number(previousPayouts._sum.commissionEarned || 0);
          commissionEarned = totalCommissionOwed - alreadyPaid;

          if (commissionEarned <= 0) continue; // Jangan generate jika tidak ada selisih bonus
        } else {
          // INCREMENTAL: Hanya bayar untuk transaksi hari ini (tapi pakai Rate Tier yang sudah terbuka!)
          if (matchingTier.rewardType === 'PERCENTAGE') {
            commissionEarned = (Number(salesRecord.totalValue) * rewardVal) / 100;
          } else {
            commissionEarned = rewardVal * salesRecord.quantity;
          }
        }

        await this.prisma.commissionRecord.create({
          data: {
            companyId: salesRecord.companyId,
            salesRecordId: salesRecord.id,
            tierId: matchingTier.id,
            rewardType: matchingTier.rewardType,
            rewardApplied: rewardVal,
            commissionEarned: commissionEarned,
          }
        });

        generatedPayouts.push({
          programName: program.name,
          rewardType: matchingTier.rewardType,
          rewardApplied: rewardVal,
          commissionEarned: commissionEarned
        });
      }
    }

    if (generatedPayouts.length === 0) {
      const targetInfo = activePrograms.map(p => {
        const qtyTiers = p.tiers.filter(t => t.tierBasis === 'QUANTITY');
        const revTiers = p.tiers.filter(t => t.tierBasis === 'REVENUE');
        const requirements = [];
        if (qtyTiers.length > 0) {
          const minQty = Math.min(...qtyTiers.map(t => Number(t.minTarget)));
          requirements.push(`${minQty} pcs`);
        }
        if (revTiers.length > 0) {
          const minRev = Math.min(...revTiers.map(t => Number(t.minTarget)));
          requirements.push(`$${minRev} revenue`);
        }
        return requirements.length > 0 ? `'${p.name}' requires at least ${requirements.join(' or ')}` : `'${p.name}' has no valid tiers`;
      }).join('. ');

      return {
        salesRepName: salesRecord.user.name,
        totalQuantitySold,
        totalValue: salesRecord.totalValue,
        message: `Sale recorded, but the targets for the active program(s) were not met. ${targetInfo}.`,
        payouts: []
      };
    }

    return {
      salesRepName: salesRecord.user.name,
      totalQuantitySold,
      totalValue: salesRecord.totalValue,
      payouts: generatedPayouts
    };
  }
}
