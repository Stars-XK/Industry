import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('组态监控与反控')
@ApiBearerAuth()
@Controller('api/scada/hmi')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HmiController {

  @Post('control')
  @ApiOperation({ summary: '下发反控指令' })
  @RequirePermissions('scada:hmi:control')
  async sendControlCommand(@Body() body: { deviceId: number; tag: string; value: any }) {
    const { deviceId, tag, value } = body;
    
    if (!deviceId || !tag || value === undefined) {
      throw new HttpException('参数不完整 (deviceId, tag, value)', HttpStatus.BAD_REQUEST);
    }

    // 模拟下发反控指令到 MQTT 的逻辑
    console.log(`[SCADA 反控] 向设备 ${deviceId} 的点位 ${tag} 下发指令值: ${value}`);
    
    // 实际生产中这里应该调用 MqttService 发送类似 client.publish('command/devices/+/set') 的消息
    // 然后通过 AuditLogInterceptor 自动记录操作日志

    return {
      success: true,
      message: '反控指令已成功下发至边缘网关',
      timestamp: Date.now()
    };
  }
}
