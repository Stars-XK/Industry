import { Controller, Get, Query } from '@nestjs/common';

@Controller('analytics')
export class AnalysisController {

  @Get('mnf')
  async getMnfAnalysis() {
    // 真实业务逻辑:
    // 1. 查询 TDengine dma_5m 中每日凌晨 2:00 - 4:00 数据
    // 2. 剥离大用户的夜间合法水量 (biz_key_account)
    // 3. 计算 AI 动态基线并比较偏差
    return {
      code: 200,
      data: {
        hasAnomaly: true,
        anomalyZone: 'DMA-001 一厂区主干管',
        dates: ['前7日', '前6日', '前5日', '前4日', '前3日', '前2日', '今日'],
        actual: [12.5, 11.2, 13.0, 25.1, 28.5, 26.3, 29.0],
        baseline: [10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5]
      },
      message: 'success'
    };
  }

  @Get('hydraulic')
  async getHydraulicSimulation() {
    // 真实业务逻辑:
    // 调用底层 Python/C++ EPANET 在线水力模型引擎服务
    return {
      code: 200,
      data: {
        scenarios: [
          { label: '模拟 V-05 阀门关闭检修', value: 'close_v05' },
          { label: '模拟 1号泵房市电中断', value: 'pump_down' },
          { label: '模拟 D300 主管爆管泄露', value: 'pipe_burst' },
          { label: '模拟 消防大栓全开取水', value: 'fire_hydrant' }
        ]
      },
      message: 'success'
    };
  }
}
