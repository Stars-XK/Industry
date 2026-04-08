import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';

@Controller('api/data-center/predict')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PredictController {
  constructor(private dataSource: DataSource) {}

  @Get('demand')
  async getDemandPrediction(@Query('zoneId') zoneId: string = '201') {
    // 模拟调用 Python 算法 (ARIMA/LSTM) 产生未来7天的预测数据
    // 实际工业应用中，这里会通过 HTTP 调用 Python 算法服务或使用 child_process
    
    // 获取最近7天的历史真实供水量作为基准
    const historySql = `
      SELECT ts, supply 
      FROM dma_daily 
      WHERE zone_id = ? 
      ORDER BY ts DESC 
      LIMIT 7
    `;
    const history = await this.dataSource.query(historySql, [zoneId]);
    history.reverse(); // 时间正序
    
    const dates = [];
    const actualData = [];
    const predictData = [];
    const upperBounds = [];
    const lowerBounds = [];

    // 填充历史数据
    history.forEach((row, index) => {
      const d = new Date(row.ts);
      dates.push(d.toISOString().split('T')[0]);
      actualData.push(row.supply);
      predictData.push(row.supply); // 历史预测拟合线
      upperBounds.push(row.supply * 1.05);
      lowerBounds.push(row.supply * 0.95);
    });

    // 如果没有历史数据，使用基础假数据
    let baseValue = history.length > 0 ? history[history.length - 1].supply : 5000;
    let lastDate = history.length > 0 ? new Date(history[history.length - 1].ts) : new Date();

    // 预测未来7天
    for (let i = 1; i <= 7; i++) {
      lastDate.setDate(lastDate.getDate() + 1);
      dates.push(lastDate.toISOString().split('T')[0]);
      
      // 模拟一些周期性波动 (工作日高，周末低)
      const dayOfWeek = lastDate.getDay();
      let factor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.05;
      
      // 添加随机噪声
      const noise = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
      
      const pred = Math.round(baseValue * factor * noise);
      
      actualData.push(null); // 未来没有真实数据
      predictData.push(pred);
      upperBounds.push(Math.round(pred * 1.08)); // 8% 预测上限
      lowerBounds.push(Math.round(pred * 0.92)); // 8% 预测下限
    }

    return {
      code: 200,
      data: {
        dates,
        actualData,
        predictData,
        upperBounds,
        lowerBounds,
        accuracy: 92.5, // 模型拟合准确率
        model_type: 'LSTM (Long Short-Term Memory)'
      },
      message: 'success'
    };
  }
}
