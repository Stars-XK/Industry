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

export function saveRevenueRules(data: any) {
  return request({
    url: '/api/v1/governance/revenue/rules',
    method: 'post',
    data
  })
}

export function triggerRecalculate(data: any) {
  return request({
    url: '/api/v1/governance/revenue/recalc',
    method: 'post',
    data
  })
}
