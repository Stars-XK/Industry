import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('安防与环境监控')
@ApiBearerAuth()
@Controller('api/scada/security')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SecurityController {
  
  // 模拟缓存的联锁状态
  private interlockState = {
    envStatus: 'normal',
    h2sValue: 5.2,
    coValue: 12.0,
    fanStatus: false,
    doorLocked: false,
    temperature: 26.5,
    humidity: 58,
    pm25: 35
  };

  @Get('environment')
  @ApiOperation({ summary: '获取密闭空间环境指标与联锁状态' })
  @RequirePermissions('scada:security')
  async getEnvironmentMetrics() {
    // 模拟服务端动态更新数据
    if (this.interlockState.envStatus === 'normal') {
      this.interlockState.h2sValue = Number((this.interlockState.h2sValue + (Math.random() * 2 - 0.5)).toFixed(1));
      this.interlockState.coValue = Number((this.interlockState.coValue + (Math.random() * 3 - 1)).toFixed(1));
      
      // 触发规则引擎联锁
      if (this.interlockState.h2sValue >= 10.0) {
        this.interlockState.envStatus = 'alert';
        this.interlockState.fanStatus = true;
        this.interlockState.doorLocked = true;
      }
    } else {
      // 报警状态下，排风扇运行，浓度下降
      this.interlockState.h2sValue = Number((this.interlockState.h2sValue - Math.random() * 1.5).toFixed(1));
      
      if (this.interlockState.h2sValue < 5.0) {
        this.interlockState.envStatus = 'normal';
        this.interlockState.fanStatus = false;
        this.interlockState.doorLocked = false;
      }
    }

    return this.interlockState;
  }

  @Post('interlock/override')
  @ApiOperation({ summary: '手动覆盖/解除联锁状态 (特权操作)' })
  @RequirePermissions('scada:security')
  async overrideInterlock(@Body() body: { targetState: string }) {
    if (body.targetState === 'bypass') {
      this.interlockState.fanStatus = false;
      this.interlockState.doorLocked = false;
    }
    return { success: true, currentState: this.interlockState };
  }
}