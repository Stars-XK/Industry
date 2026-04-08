import { Controller, Get, Query } from '@nestjs/common';

@Controller('analytics/nrw')
export class NrwController {
  
  @Get('sankey')
  async getNrwSankey() {
    // 真实业务逻辑:
    // 按照 IWA 国际水协水量平衡表标准，计算:
    // 供水量 = 合法用水量(计费+免费) + 漏损水量(物理漏损+表观漏损)
    // 需要从 TDengine 聚合 dma_daily，并关联营收库 biz_tariff
    return {
      code: 200,
      data: {
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
      },
      message: 'success'
    };
  }

  @Get('trend')
  async getNrwTrend(@Query('dmaId') dmaId: string) {
    // 真实业务逻辑: 
    // 查询该 DMA 分区过去 12 个月的产销差同环比趋势
    return {
      code: 200,
      data: {
        months: ['1月','2月','3月','4月','5月','6月'],
        nrwRates: [18.2, 17.5, 19.1, 16.8, 15.5, 14.2],
        waterLoss: [3500, 3200, 3800, 3000, 2800, 2500]
      },
      message: 'success'
    };
  }
}
