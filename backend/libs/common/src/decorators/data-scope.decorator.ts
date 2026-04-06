import { SetMetadata } from '@nestjs/common';

export const DATA_SCOPE_KEY = 'data_scope';

export interface DataScopeOptions {
  deptAlias?: string; // 查询中部门表的别名，默认为 'dept'
  userAlias?: string; // 查询中用户表的别名，默认为 'user'
}

// 可选：用于标记某个接口需要进行数据范围过滤
export const DataScope = (options: DataScopeOptions = {}) => SetMetadata(DATA_SCOPE_KEY, options);
