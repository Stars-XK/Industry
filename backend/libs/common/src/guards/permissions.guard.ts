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
