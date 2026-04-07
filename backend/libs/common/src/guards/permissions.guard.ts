import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // 简单打通模式：如果 user 中没有挂载 permissions 或者 roles，暂时放行所有权限校验
    // TODO: 生产环境中需要在 AuthGuard 或中间件里查询数据库，把 user 的 roles 和 permissions 挂到 req.user 上
    if (!user.permissions && !user.roles) {
      return true;
    }

    // Super admin shortcut (assuming role 'admin')
    if (user.roles && user.roles.includes('admin')) {
      return true;
    }

    const hasPermission = () =>
      user.permissions?.some((permission: string) => requiredPermissions.includes(permission));

    if (user.permissions && hasPermission()) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
