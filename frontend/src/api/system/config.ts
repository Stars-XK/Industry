import request from '@/utils/request';

// 获取所有配置列表
export function listConfig(query: any) {
  return request({
    url: '/api/v1/system/config/list',
    method: 'get',
    params: query
  });
}

// 获取公开的全局配置（无需 Token）
export function getGlobalConfig() {
  return request({
    url: '/api/v1/system/config/global',
    method: 'get'
  });
}

// 根据 ID 获取详细信息
export function getConfig(id: number) {
  return request({
    url: '/api/v1/system/config/' + id,
    method: 'get'
  });
}

// 新增配置
export function addConfig(data: any) {
  return request({
    url: '/api/v1/system/config',
    method: 'post',
    data: data
  });
}

// 修改配置
export function updateConfig(data: any) {
  return request({
    url: '/api/v1/system/config',
    method: 'put',
    data: data
  });
}

// 批量修改配置
export function batchUpdateConfig(configs: any[]) {
  return request({
    url: '/api/v1/system/config/batch',
    method: 'put',
    data: { configs }
  });
}

// 删除配置
export function delConfig(ids: string) {
  return request({
    url: '/api/v1/system/config/' + ids,
    method: 'delete'
  });
}
