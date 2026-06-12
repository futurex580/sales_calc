import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TierBasis, RewardType } from '@prisma/client';
import { CreateCommissionRuleTierDto } from './dto/create-commission-rule-tier.dto';
import { UpdateCommissionRuleTierDto } from './dto/update-commission-rule-tier.dto';

@Injectable()
export class CommissionRuleTiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommissionRuleTierDto: CreateCommissionRuleTierDto, userId: string, companyId: string) {
    const rule = await this.prisma.commissionRuleTier.create({
      data: {
        ...createCommissionRuleTierDto, // Spread the user-provided data (minQuantity, commissionPercent, etc.)
        tierBasis: createCommissionRuleTierDto.tierBasis as TierBasis,
        rewardType: createCommissionRuleTierDto.rewardType as RewardType,
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

    findAll(companyId: string) {
    return this.prisma.commissionRuleTier.findMany({
      where: { companyId }, // <--- Filter Proteksi Company
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

  async update(id: string, updateCommissionRuleTierDto: UpdateCommissionRuleTierDto, userId: string, companyId: string) {
    const updateData: any = { ...updateCommissionRuleTierDto };
    if (updateData.tierBasis) updateData.tierBasis = updateData.tierBasis as TierBasis;
    if (updateData.rewardType) updateData.rewardType = updateData.rewardType as RewardType;

    const rule = await this.prisma.commissionRuleTier.update({
      where: { id },
      data: updateData,
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
