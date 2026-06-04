import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-development-key',
    });
  }

  async validate(payload: any) {
    // This payload matches what we signed during login in auth.service.ts
    // It automatically attaches this object to `req.user` in our controllers!
    return { id: payload.sub, email: payload.email, role: payload.role, companyId: payload.companyId };
  }
}