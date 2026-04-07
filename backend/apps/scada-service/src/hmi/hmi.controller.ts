import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HmiGateway } from './hmi.gateway';

@ApiTags('组态监控与反控')
@ApiBearerAuth()
@Controller('api/scada/hmi')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HmiController {
  constructor(private readonly hmiGateway: HmiGateway) {}

  @Post('control')
  @ApiOperation({ summary: '下发反控指令' })
  @RequirePermissions('scada:hmi:control')
  async sendControlCommand(@Body() body: { deviceId: number; tag: string; value: any }) {
    const { deviceId, tag, value } = body;
    
    if (!deviceId || !tag || value === undefined) {
      throw new HttpException('参数不完整 (deviceId, tag, value)', HttpStatus.BAD_REQUEST);
    }

    // 实际下发反控指令到 MQTT
    const success = this.hmiGateway.publishCommand(deviceId, tag, value);
    if (!success) {
      throw new HttpException('MQTT Broker 连接异常，指令下发失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      success: true,
      message: '反控指令已成功下发至边缘网关',
      timestamp: Date.now()
    };
  }
}
