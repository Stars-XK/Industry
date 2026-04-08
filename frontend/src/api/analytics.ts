import request from '@/utils/request'

export function getMNFData(params?: any) {
  return request({
    url: '/api/v1/analytics/mnf',
    method: 'get',
    params
  })
}

export function getHydraulicSimulation() {
  return request({
    url: '/api/v1/analytics/hydraulic',
    method: 'get'
  })
}
