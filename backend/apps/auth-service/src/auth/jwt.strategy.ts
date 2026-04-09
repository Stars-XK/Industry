import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token')
      ]),
      ignoreExpiration: false,
      secretOrKey: 'YOUR_SECRET_KEY', // 生产环境请使用环境变量
    });
  }

  async validate(payload: any) {
    // payload 是签发时存进去的 { username, sub, dept_id }
    return { userId: payload.sub, username: payload.username, deptId: payload.dept_id };
  }
}
