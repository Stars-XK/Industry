import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DataSource } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.userId) {
      throw new ForbiddenException('User not found');
    }

    // 工业级权限验证：动态查询数据库获取当前用户所有角色的权限字
    const roleQuery = `
      SELECT r.role_key 
      FROM sys_user_role ur
      JOIN sys_role r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND r.status = 1
    `;
    const rolesResult = await this.dataSource.query(roleQuery, [user.userId]);
    const roles = rolesResult.map((r: any) => r.role_key);

    // 超级管理员直接放行
    if (roles.includes('admin')) {
      return true;
    }

    // 联合查询用户所有角色的权限字
    const permQuery = `
      SELECT m.perm_code
      FROM sys_user_role ur
      JOIN sys_role_menu rm ON ur.role_id = rm.role_id
      JOIN sys_menu m ON rm.menu_id = m.id
      WHERE ur.user_id = ? AND m.status = 1 AND m.perm_code IS NOT NULL AND m.perm_code != ''
    `;
    const permsResult = await this.dataSource.query(permQuery, [user.userId]);
    const permissions = permsResult.map((p: any) => p.perm_code);

    const hasPermission = requiredPermissions.some((reqPerm) => permissions.includes(reqPerm));

    if (hasPermission) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
