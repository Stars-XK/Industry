import { Controller, Post, Body, Get } from '@nestjs/common';

@Controller('governance/revenue')
export class RevenueController {
  
  @Get('rules')
  async getAllocationRules() {
    // 真实业务逻辑:
    // 从 MySQL biz_revenue_rule 获取月度售水量到日的分摊平滑折算算法规则
    // (例如：工作日 1.2，周末 0.8，根据节假日 API 自动算)
    return {
      code: 200,
      data: [
        { id: 1, ruleName: '工业区标准工作日分摊法', weightWeekday: 1.3, weightWeekend: 0.4 },
        { id: 2, ruleName: '居民区节假日激增平滑法', weightWeekday: 0.9, weightWeekend: 1.2 }
      ],
      message: 'success'
    };
  }

  @Post('import')
  async importRevenueExcel(@Body() body: { filePath: string }) {
    // 真实业务逻辑:
    // 1. 读取营收组传过来的 Excel 财务账单 (抄表水量、计费金额)
    // 2. 将数据落入 `dma_monthly` 月统计表
    // 3. 触发 Kafka/RabbitMQ 异步事件，启动日分摊清洗任务 (调用 `executeRecalculate` )
    return {
      code: 200,
      data: { importedCount: 1542, unassignedCount: 12 },
      message: '营收数据清洗并分摊入库成功'
    };
  }
}
