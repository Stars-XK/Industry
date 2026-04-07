import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../libs/entities/src/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    // 我们在 pg_seed.sql 里写死的 hash 对应的是 'admin123'
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('密码错误');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账户已被锁定或停用');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, dept_id: user.dept_id };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
