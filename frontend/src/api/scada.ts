import request from '@/utils/request'

export function getSecurityData() {
  return request({
    url: '/api/v1/scada/security',
    method: 'get'
  })
}

export function getOverviewData() {
  return request({
    url: '/api/v1/scada/overview',
    method: 'get'
  })
}
