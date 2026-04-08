import { Controller, Get, Query } from '@nestjs/common';

@Controller('data-center/analytics/nrw')
export class NrwController {
  
  @Get()
  async getNrwList(@Query('month') month: string) {
    // 真实业务逻辑:
    // 从 dma_daily 表中聚合指定月份各 DMA 的供水量、售水量、漏损率
    return [
      { zone_id: 101, zone_name: '浦东张江高科技园区', report_month: month || '2026-03', supply: 125000, sale: 105000, loss_rate: 16.0 },
      { zone_id: 102, zone_name: '徐汇漕河泾开发区', report_month: month || '2026-03', supply: 85000, sale: 75000, loss_rate: 11.7 },
      { zone_id: 103, zone_name: '临港滴水湖新片区', report_month: month || '2026-03', supply: 42000, sale: 36000, loss_rate: 14.2 }
    ];
  }

  @Get('sankey')
  async getNrwSankey() {
    // 真实业务逻辑:
    // 按照 IWA 国际水协水量平衡表标准，计算:
    // 供水量 = 合法用水量(计费+免费) + 漏损水量(物理漏损+表观漏损)
    // 需要从 TDengine 聚合 dma_daily，并关联营收库 biz_tariff
    return {
      nodes: [
        { name: '总供水量' },
        { name: '合法用水' },
        { name: '真实漏损' },
        { name: '计费水量' },
        { name: '未计费水量' },
        { name: '表观漏损' },
        { name: '物理暗漏' },
        { name: '明漏及溢流' }
      ],
      links: [
        { source: '总供水量', target: '合法用水', value: 85000 },
        { source: '总供水量', target: '真实漏损', value: 15000 },
        { source: '合法用水', target: '计费水量', value: 80000 },
        { source: '合法用水', target: '未计费水量', value: 5000 },
        { source: '真实漏损', target: '表观漏损', value: 3000 },
        { source: '真实漏损', target: '物理暗漏', value: 10000 },
        { source: '真实漏损', target: '明漏及溢流', value: 2000 }
      ]
    };
  }

  @Get('trend')
  async getNrwTrend(@Query('dmaId') dmaId: string) {
    // 真实业务逻辑:
    // 查询该 DMA 分区过去 12 个月的产销差同环比趋势
    return {
      months: ['1月','2月','3月','4月','5月','6月'],
      nrwRates: [18.2, 17.5, 19.1, 16.8, 15.5, 14.2],
      waterLoss: [3500, 3200, 3800, 3000, 2800, 2500]
    };
  }
}
