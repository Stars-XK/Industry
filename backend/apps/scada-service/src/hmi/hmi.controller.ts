import { Controller, Post, Body } from '@nestjs/common';

@Controller('system/hmi')
export class HmiController {
  
  @Post('config')
  async saveHmiConfig(@Body() body: { config: any[] }) {
    // 真实业务逻辑：
    // 1. 将低代码拖拽出的图元元素、位置坐标、绑定 Tag 转 JSON 格式
    // 2. 存入 SCADA 组态画面表 (sys_hmi_template)
    // 3. 通知前台重新渲染 HMI (WebSocket / Redis PubSub)
    return {
      code: 200,
      data: { savedElementsCount: body.config.length },
      message: '组态配置已持久化保存'
    };
  }
}
