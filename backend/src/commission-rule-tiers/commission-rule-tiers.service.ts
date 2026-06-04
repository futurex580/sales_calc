import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommissionRuleTiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedCreateInput, userId: string, companyId: string) {
    const rule = await this.prisma.commissionRuleTier.create({
      data: {
        ...createCommissionRuleTierDto, // Spread the user-provided data (minQuantity, commissionPercent, etc.)
        companyId: companyId,           // FORCE the secure companyId from the JWT token!
      },
    });

    const auditData: Prisma.AuditLogUncheckedCreateInput = {
      action: 'CREATE_RULE_TIER',
      userId: userId,
      companyId: companyId,
      entity: 'CommissionRuleTier',
      entityId: rule.id,
      details: JSON.stringify(createCommissionRuleTierDto),
    };

    // Write the Audit Log securely
    await this.prisma.auditLog.create({
      data: auditData,
    });

    return rule;
  }

  findAll() {
    return this.prisma.commissionRuleTier.findMany({
      include: { 
        incentiveProgram: {
          include: {
            products: { select: { id: true, name: true } }
          }
        }
      },
    });
  }

  findOne(id: string) {
    return this.prisma.commissionRuleTier.findUnique({
      where: { id },
      include: { 
        incentiveProgram: {
          include: {
            products: { select: { id: true, name: true } }
          }
        }
      },
    });
  }

  async update(id: string, updateCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedUpdateInput, userId: string, companyId: string) {
    const rule = await this.prisma.commissionRuleTier.update({
      where: { id },
      data: updateCommissionRuleTierDto,
    });

    const auditData: Prisma.AuditLogUncheckedCreateInput = {
      action: `UPDATE_RULE_TIER_${id}`,
      userId: userId,
      companyId: companyId,
      entity: 'CommissionRuleTier',
      entityId: id,
      details: JSON.stringify(updateCommissionRuleTierDto),
    };

    await this.prisma.auditLog.create({
      data: auditData,
    });

    return rule;
  }

  async remove(id: string, userId: string, companyId: string) {
    const rule = await this.prisma.commissionRuleTier.delete({
      where: { id },
    });

    const auditData: Prisma.AuditLogUncheckedCreateInput = {
      action: `DELETE_RULE_TIER_${id}`,
      userId: userId,
      companyId: companyId,
      entity: 'CommissionRuleTier',
      entityId: id,
      details: 'Rule deleted',
    };

    await this.prisma.auditLog.create({
      data: auditData,
    });

    return rule;
  }
}
