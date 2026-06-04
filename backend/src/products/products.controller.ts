import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: Prisma.ProductUncheckedCreateInput, @Req() req: any) {
    return this.productsService.create(createProductDto, req.user.companyId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.productsService.findAll(req.user.companyId);
  }
}