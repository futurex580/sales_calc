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
