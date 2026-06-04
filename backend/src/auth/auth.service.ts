import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Hash the plain-text password before saving it to the database
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.prisma.user.create({
  data: {
    email: registerDto.email,
    name: registerDto.name,
    role: registerDto.role,
    passwordHash: hashedPassword,
    // Connect to an existing company if companyId is provided, 
    // otherwise create a brand new company using companyName
    company: registerDto.companyId
      ? { connect: { id: registerDto.companyId } }
      : { create: { name: registerDto.companyName } }
  }
});

    
    // Return a safe user object (never return the password hash!)
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(loginDto: LoginDto) {
    // 1. Find the user by their email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // 2. Check if the user exists and the password matches the hash
    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate a secure JWT containing user details
    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}