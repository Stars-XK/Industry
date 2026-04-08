import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('scada/security')
export class SecurityController {
  
  @Get()
  async getSecurityData() {
    // 真实业务逻辑:
    // 1. 查询监控摄像头列表
    // 2. 查询底层环境传感器实时值
    // 3. 查询门禁状态
    
    return {
      code: 200,
      data: {
        cameras: [
          { id: 1, name: '1号厂区主门', url: 'rtsp://admin:123@192.168.1.10/main' },
          { id: 2, name: '加药车间', url: 'rtsp://admin:123@192.168.1.11/main' },
          { id: 3, name: '二供泵房', url: 'rtsp://admin:123@192.168.1.12/main' },
          { id: 4, name: '危化品库', url: 'rtsp://admin:123@192.168.1.13/main' }
        ],
        environment: {
          h2s: 0.02,
          co: 1.5,
          temp: 26.5,
          humidity: 45.0
        },
        doors: [
          { id: 1, name: '1号泵房 - 主防爆门', locked: true },
          { id: 2, name: '加药车间 - 侧门', locked: true },
          { id: 3, name: '高压配电室 - A门', locked: true }
        ]
      },
      message: 'success'
    };
  }

  @Post('door/lock')
  async lockDoor(@Body() body: { doorId: number }) {
    // 真实业务逻辑: 下发锁门指令给 MQTT/OPC UA 网关
    return { code: 200, message: `门禁 ${body.doorId} 已执行紧急锁死指令` };
  }
}
