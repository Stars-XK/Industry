import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('安防与环境监控')
@ApiBearerAuth()
@Controller('api/scada/security')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SecurityController {
  constructor(private dataSource: DataSource) {}
  
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
  async getEnvironmentMetrics(@Query('deviceId') deviceId?: number) {
    const targetDeviceId = deviceId || 4; // 默认使用设备 4 (徐汇地下泵站环境传感器)
    try {
      const query = `
        SELECT standard_name, value 
        FROM device_raw 
        WHERE device_id = ? AND standard_name IN ('temperature', 'humidity', 'h2s', 'co', 'pm25')
        ORDER BY timestamp DESC
        LIMIT 5
      `;
      const res = await this.dataSource.query(query, [targetDeviceId]);
      res.forEach(r => {
        if (r.standard_name === 'temperature') this.interlockState.temperature = r.value;
        if (r.standard_name === 'humidity') this.interlockState.humidity = r.value;
        if (r.standard_name === 'h2s') this.interlockState.h2sValue = r.value;
        if (r.standard_name === 'co') this.interlockState.coValue = r.value;
        if (r.standard_name === 'pm25') this.interlockState.pm25 = r.value;
      });

      this.interlockState.h2sValue = Number(this.interlockState.h2sValue.toFixed(1));
      this.interlockState.coValue = Number(this.interlockState.coValue.toFixed(1));
      this.interlockState.temperature = Number(this.interlockState.temperature.toFixed(1));
      this.interlockState.humidity = Number(this.interlockState.humidity.toFixed(1));
      this.interlockState.pm25 = Number(this.interlockState.pm25.toFixed(1));

      // 触发规则引擎联锁
      if (this.interlockState.h2sValue >= 10.0) {
        this.interlockState.envStatus = 'alert';
        this.interlockState.fanStatus = true;
        this.interlockState.doorLocked = true;
      } else if (this.interlockState.h2sValue < 5.0 && this.interlockState.envStatus === 'alert') {
        this.interlockState.envStatus = 'normal';
        this.interlockState.fanStatus = false;
        this.interlockState.doorLocked = false;
      }
    } catch (e) {
      console.error('获取环境数据失败', e);
      // Fallback 模拟 (无依赖 Math.random 的确定性平滑波动)
      const sec = new Date().getSeconds();
      if (this.interlockState.envStatus === 'normal') {
        this.interlockState.h2sValue = Number((this.interlockState.h2sValue + (sec % 2 === 0 ? 0.2 : -0.1)).toFixed(1));
        this.interlockState.coValue = Number((this.interlockState.coValue + (sec % 3 === 0 ? 0.3 : -0.2)).toFixed(1));
        
        // 触发规则引擎联锁
        if (this.interlockState.h2sValue >= 10.0) {
          this.interlockState.envStatus = 'alert';
          this.interlockState.fanStatus = true;
          this.interlockState.doorLocked = true;
        }
      } else {
        // 报警状态下，排风扇运行，浓度下降
        this.interlockState.h2sValue = Number((this.interlockState.h2sValue - 0.8).toFixed(1));
        
        if (this.interlockState.h2sValue < 5.0) {
          this.interlockState.envStatus = 'normal';
          this.interlockState.fanStatus = false;
          this.interlockState.doorLocked = false;
        }
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