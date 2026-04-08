import request from '@/utils/request'

export function getInterlockRules() {
  return request({
    url: '/api/v1/governance/interlock/rules',
    method: 'get'
  })
}

export function updateInterlockRule(data: any) {
  return request({
    url: '/api/v1/governance/interlock/rules',
    method: 'put',
    data
  })
}
