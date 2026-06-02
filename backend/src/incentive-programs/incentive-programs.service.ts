import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncentiveProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createIncentiveProgramDto: Prisma.IncentiveProgramUncheckedCreateInput) {
    return this.prisma.incentiveProgram.create({
      data: createIncentiveProgramDto,
    });
  }

  findAll() {
    return this.prisma.incentiveProgram.findMany({
      include: { company: true },
    });
  }

  findOne(id: string) {
    return this.prisma.incentiveProgram.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  update(id: string, updateIncentiveProgramDto: Prisma.IncentiveProgramUncheckedUpdateInput) {
    return this.prisma.incentiveProgram.update({
      where: { id },
      data: updateIncentiveProgramDto,
    });
  }

  remove(id: string) {
    return this.prisma.incentiveProgram.delete({
      where: { id },
    });
  }
}