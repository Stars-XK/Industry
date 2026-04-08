import request from '@/utils/request'

export function saveHMIConfig(data: any) {
  return request({
    url: '/api/v1/system/hmi/config',
    method: 'post',
    data
  })
}
