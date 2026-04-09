import { defineStore } from 'pinia';
import { getGlobalConfig } from '@/api/system/config';

export const useConfigStore = defineStore('sysConfig', {
  state: () => ({
    sysTitle: '信创工业综合治理平台',
    sysLogo: '/logo.png',
    mapSource: 'amap',
    mapCenter: [118.67, 24.87] as [number, number],
    mailSmtp: '',
    configs: {} as Record<string, string>,
  }),
  actions: {
    async fetchGlobalConfig() {
      try {
        const res = await getGlobalConfig();
        const data = res as Record<string, string>;
        if (data) {
          this.configs = data;
          if (data['sys.site.title']) this.sysTitle = data['sys.site.title'];
          if (data['sys.site.logo']) this.sysLogo = data['sys.site.logo'];
          if (data['sys.map.source']) this.mapSource = data['sys.map.source'];
          if (data['sys.mail.smtp']) this.mailSmtp = data['sys.mail.smtp'];
          if (data['sys.map.center']) {
            try {
              this.mapCenter = JSON.parse(data['sys.map.center']);
            } catch (e) {
              console.error('解析地图中心点失败:', e);
            }
          }
          // 动态修改浏览器标签页标题
          document.title = this.sysTitle;
        }
      } catch (error) {
        console.error('Failed to fetch global config', error);
      }
    }
  }
});
