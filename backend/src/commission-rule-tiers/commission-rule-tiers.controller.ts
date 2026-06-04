import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CommissionRuleTiersService } from './commission-rule-tiers.service';
import { Prisma, Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('commission-rule-tiers')
export class CommissionRuleTiersController {
  constructor(private readonly commissionRuleTiersService: CommissionRuleTiersService) {}

  // Only Admins can create new rules
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @Post()
  create(@Body() createCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedCreateInput, @Req() req: any) {
    // Safely extract the user ID, with a fallback for when guards are disabled during dev
    const userId = req.user?.id || 'DEV_MODE_NO_USER';
    const companyId = req.user?.companyId || 'DEV_MODE_NO_COMPANY';
    return this.commissionRuleTiersService.create(createCommissionRuleTierDto, userId, companyId);
  }

  @Get()
  findAll() {
    return this.commissionRuleTiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionRuleTiersService.findOne(id);
  }

  // Only Admins can update rules
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedUpdateInput, @Req() req: any) {
    const userId = req.user?.id || 'DEV_MODE_NO_USER';
    const companyId = req.user?.companyId || 'DEV_MODE_NO_COMPANY';
    return this.commissionRuleTiersService.update(id, updateCommissionRuleTierDto, userId, companyId);
  }

  // Only Admins can delete rules
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'DEV_MODE_NO_USER';
    const companyId = req.user?.companyId || 'DEV_MODE_NO_COMPANY';
    return this.commissionRuleTiersService.remove(id, userId, companyId);
  }
}
