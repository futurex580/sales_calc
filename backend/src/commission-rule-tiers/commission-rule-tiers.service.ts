import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommissionRuleTiersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedCreateInput) {
    return this.prisma.commissionRuleTier.create({
      data: createCommissionRuleTierDto,
    });
  }

  findAll() {
    return this.prisma.commissionRuleTier.findMany({
      include: { incentiveProgram: true },
    });
  }

  findOne(id: string) {
    return this.prisma.commissionRuleTier.findUnique({
      where: { id },
      include: { incentiveProgram: true },
    });
  }

  update(id: string, updateCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedUpdateInput) {
    return this.prisma.commissionRuleTier.update({
      where: { id },
      data: updateCommissionRuleTierDto,
    });
  }

  remove(id: string) {
    return this.prisma.commissionRuleTier.delete({
      where: { id },
    });
  }
}
