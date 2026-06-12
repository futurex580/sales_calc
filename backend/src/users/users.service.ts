import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto, adminCompanyId: string) {
    // Cek apakah email sudah terdaftar sebelumnya
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new ConflictException('This email is already registered in the system.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        role: data.role as Role,
        company: { connect: { id: adminCompanyId } }
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

   findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId }, // <--- Filter Proteksi Company
      // Opsional: jangan melempar passwordHash ke Frontend
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ktp: true,
        bankAccount: true,
        createdAt: true,
        companyId: true
      }
    });
  }


  async updateRole(id: string, role: Role, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new NotFoundException('User not found');
    
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });
  }

  async remove(id: string, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.companyId !== companyId) throw new NotFoundException('User not found');
    
    return this.prisma.user.delete({ where: { id } });
  }
}