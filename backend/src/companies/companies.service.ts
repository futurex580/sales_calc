import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCompanyDto: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  findAll() {
    return this.prisma.company.findMany();
  }

   findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        // 2. Include the Users
        users: true, 
        // 3. Include the Products
        products: true, 
        // 4. Include the Sales Records
        salesRecords: true, 
        // 5 & 6. Include Incentive Programs AND their nested Tiers
        incentivePrograms: {
          include: {
            tiers: true 
          }
        }
      }
    });
  }


  update(id: string, updateCompanyDto: Prisma.CompanyUpdateInput) {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  remove(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
