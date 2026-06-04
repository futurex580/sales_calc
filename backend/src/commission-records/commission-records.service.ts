import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommissionRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCommissionRecordDto: Prisma.CommissionRecordUncheckedCreateInput) {
    return this.prisma.commissionRecord.create({
      data: createCommissionRecordDto,
    });
  }

  async getPayoutReport() {
    // 1. Fetch all commission records, deeply including the related user via the salesRecord
    const records = await this.prisma.commissionRecord.findMany({
      include: {
        salesRecord: {
          include: {
            user: true, // Pull in the user to get their name for the report!
          },
        },
      },
    });

    // 2. Aggregate the records in-memory by User ID
    const report = {};

    for (const record of records) {
      // Safely extract the user details and commission amount
      const user = (record as any).salesRecord?.user;
      const userId = user?.id || 'Unknown';
      const userName = user?.name || 'Unknown Rep';
      const commissionAmount = Number((record as any).amount) || 0;

      if (!report[userId]) {
        report[userId] = { userId, name: userName, totalPayout: 0, commissionsCount: 0 };
      }

      report[userId].totalPayout += commissionAmount;
      report[userId].commissionsCount += 1;
    }

    // 3. Return a clean array of the final payout summaries
    return Object.values(report);
  }

  findAll() {
    return this.prisma.commissionRecord.findMany({
      include: {
        salesRecord: true, // Let's include the related sale data so it's easy to read!
      }
    });
  }

  findOne(id: string) {
    return this.prisma.commissionRecord.findUnique({
      where: { id },
      include: { salesRecord: true },
    });
  }

  update(id: string, updateCommissionRecordDto: Prisma.CommissionRecordUncheckedUpdateInput) {
    return this.prisma.commissionRecord.update({
      where: { id },
      data: updateCommissionRecordDto,
    });
  }

  remove(id: string) {
    return this.prisma.commissionRecord.delete({
      where: { id },
    });
  }
}
