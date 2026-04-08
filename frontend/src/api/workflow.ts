import request from '@/utils/request'

export function getDutyLocations() {
  return request({
    url: '/api/v1/workflow/duty-locations',
    method: 'get'
  })
}

export function sendAIGCCommand(data: any) {
  return request({
    url: '/api/v1/workflow/aigc/command',
    method: 'post',
    data
  })
}
