import { Controller, Get, Put, Body } from '@nestjs/common';

@Controller('governance/interlock')
export class InterlockController {
  
  @Get('rules')
  async getRules() {
    // 真实业务逻辑：
    // 查询 SCADA 报警因果矩阵联锁策略配置表
    return {
      code: 200,
      data: [
        { id: 1, cause: '1号清水池 液位 > 4.8m (高高报)', effect: '强制关闭 [1号进水泵]', delay: 5, status: true, bypass: false },
        { id: 2, cause: '加药车间 硫化氢浓度 > 10ppm', effect: '开启 [顶置排风扇] 并锁定 [区域门禁]', delay: 0, status: true, bypass: true },
        { id: 3, cause: '管网节点 P02 压力 < 0.15MPa', effect: '联动 [二供变频泵] 频率上调 5Hz', delay: 30, status: false, bypass: false }
      ],
      message: 'success'
    };
  }

  @Put('rules')
  async updateBypass(@Body() body: { id: number, bypass: boolean }) {
    // 真实业务逻辑：
    // 1. 鉴权：检查是否拥有高级工程师角色
    // 2. 修改数据库规则的 Bypass 字段
    // 3. 记录日志 (sys_audit_log)：包含防篡改、差异 JSON
    return {
      code: 200,
      data: body,
      message: `旁路状态已更新为 ${body.bypass ? '开启' : '关闭'}`
    };
  }
}
