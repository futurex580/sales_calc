import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, companyId: string, userId: string) {
    const product = await this.prisma.product.create({
      data: { ...createProductDto, companyId },
    });
    
    await this.prisma.auditLog.create({
      data: {
        companyId, userId, action: 'CREATE_PRODUCT', entity: 'Product', entityId: product.id,
        details: `Created new product: ${product.name} (Price: ${product.basePrice})`
      }
    });
    return product;
  }

  findAll(companyId: string) {
    return this.prisma.product.findMany({ where: { companyId } });
  }

  async update(id: string, updateProductDto: UpdateProductDto, companyId: string, userId: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.prisma.auditLog.create({
      data: {
        companyId, userId, action: 'UPDATE_PRODUCT', entity: 'Product', entityId: product.id,
        details: `Updated product details for: ${product.name}`
      }
    });
    return product;
  }

  async remove(id: string, companyId: string, userId: string) {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId, userId, action: 'DELETE_PRODUCT', entity: 'Product', entityId: product.id,
        details: `Deleted product: ${product.name}`
      }
    });
    return product;
  }
}