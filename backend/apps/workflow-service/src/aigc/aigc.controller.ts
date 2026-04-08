import { Controller, Post, Body, Get } from '@nestjs/common';

@Controller('workflow')
export class AigcController {
  
  @Get('duty-locations')
  async getDutyLocations() {
    // 真实业务逻辑：
    // 从 wf_duty_schedule 查询当天当班人员，并结合设备终端(如安全帽/手环)上报的 GPS 定位计算距离
    return {
      code: 200,
      data: [
        { id: 1, name: '王五 (机电班长)', type: 'person', distance: '120m' },
        { id: 2, name: '赵六 (网管员)', type: 'person', distance: '850m' },
        { id: 3, name: '抢修皮卡 沪B999', type: 'vehicle', distance: '15m' },
        { id: 4, name: '大排量抽水泵车', type: 'vehicle', distance: '1.5km' }
      ],
      message: 'success'
    };
  }

  @Post('aigc/command')
  async handleAigcCommand(@Body() body: { command: string }) {
    // 真实业务逻辑：
    // 1. 调用 LLM 模型 (DeepSeek/Qwen 等) 解析自然语言
    // 2. 根据解析出的实体(Entities) 查询数据库/知识库
    // 3. 生成可执行动作列表返回
    
    let title = 'AI 已生成通用建议单';
    let actions = ['收到指令，正在解析您的需求...', '请提供更多明确的参数。'];

    if (body.command.includes('防汛') || body.command.includes('暴雨')) {
      title = '已生成【防汛应急与设备抢险 SOP】';
      actions = [
        '指令下发：提前抽空雨水泵站调节池',
        '库存核对：防汛沙袋当前库存 120只 (安全)',
        '排班调度：已安排机电班长王五带队前往低洼区巡视'
      ];
    } else if (body.command.includes('能耗') || body.command.includes('电')) {
      title = '已生成【能效错峰优化排班单】';
      actions = [
        '分析：昨日 10:00-12:00 峰电时段吨水百米能耗超标',
        '建议：将 3 号大功率清水泵运行时间调整至 22:00 谷电时段',
        '预计降本：日均节省电费 12% 约 450 元'
      ];
    }

    return {
      code: 200,
      data: { title, actions },
      message: 'success'
    };
  }
}
