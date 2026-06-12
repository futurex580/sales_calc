import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.COMPANY_ADMIN) // Hanya admin yang boleh masuk ke route ini!
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(createUserDto, req.user.companyId);
  }

    @Get()
  findAll(@Req() req: any) {
    return this.usersService.findAll(req.user.companyId);
  }


  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: Role, @Req() req: any) {
    return this.usersService.updateRole(id, role, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.remove(id, req.user.companyId);
  }
}