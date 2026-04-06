import { SelectQueryBuilder } from 'typeorm';

/**
 * 动态数据范围拼装辅助函数
 * @param qb TypeORM 的 SelectQueryBuilder
 * @param user 当前请求的用户对象 (需包含 roles 及其 data_scope 信息, 以及 deptId)
 * @param deptAlias 数据库查询时部门字段所在表的别名
 */
export function applyDataScope<T>(
  qb: SelectQueryBuilder<T>,
  user: any,
  deptAlias: string = 'dept_id'
): SelectQueryBuilder<T> {
  // 1. 获取用户所有角色的数据范围
  // data_scope: 1-全部数据, 2-本部门及以下数据, 3-仅本人数据, etc.
  if (!user || !user.roles) {
    // 未知身份或无角色，默认阻断所有查询 (1 = 0)
    qb.andWhere('1 = 0');
    return qb;
  }

  // 2. 如果包含超管角色或拥有“全部数据(1)”权限，直接放行
  const isSuperAdmin = user.roles.some((r: any) => r.role_key === 'admin');
  const hasAllScope = user.roles.some((r: any) => r.data_scope === 1);
  if (isSuperAdmin || hasAllScope) {
    return qb;
  }

  // 3. 检查是否有“本部门数据(2)”权限
  const hasDeptScope = user.roles.some((r: any) => r.data_scope === 2);
  if (hasDeptScope && user.deptId) {
    qb.andWhere(`${deptAlias} = :deptId`, { deptId: user.deptId });
    return qb;
  }

  // 4. 其他情况（如自定义权限等），这里简化为仅自己
  qb.andWhere(`${deptAlias} = :deptId`, { deptId: user.deptId }); // 默认保底

  return qb;
}
