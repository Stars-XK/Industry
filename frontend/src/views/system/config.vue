
<template>
  <div class="app-container config-container">
    <div class="settings-layout">
      <!-- 左侧导航 -->
      <div class="settings-sidebar">
        <div class="sidebar-title">系统偏好设置</div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'basic' }"
          @click="activeTab = 'basic'"
        >
          <el-icon class="nav-icon"><Setting /></el-icon>
          常规与基础
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'theme' }"
          @click="activeTab = 'theme'"
        >
          <el-icon class="nav-icon"><Brush /></el-icon>
          外观与个性化
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'map' }"
          @click="activeTab = 'map'"
        >
          <el-icon class="nav-icon"><Location /></el-icon>
          GIS 地理引擎
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'notification' }"
          @click="activeTab = 'notification'"
        >
          <el-icon class="nav-icon"><Message /></el-icon>
          消息与通知通道
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="settings-content">
        <div class="section-header">
          <h2 class="section-title">
            {{ activeTab === 'basic' ? '常规与基础' : 
               activeTab === 'theme' ? '外观与个性化' : 
               activeTab === 'map' ? 'GIS 地理引擎' : '消息与通知通道' }}
          </h2>
          <el-button type="primary" @click="handleBatchSave" size="large" class="save-btn">
            <el-icon style="margin-right: 6px;"><Check /></el-icon> 保存更改
          </el-button>
        </div>

        <div class="setting-card" v-show="activeTab === 'basic'">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">平台全局名称</div>
              <div class="setting-desc">将显示在浏览器标签页、登录页以及左上角导航栏的主标题。</div>
            </div>
            <div class="setting-action">
              <el-input v-model="formData['sys.site.title']" placeholder="如：信创工业综合治理平台" size="large" />
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">企业品牌 Logo</div>
              <div class="setting-desc">支持输入外部 URL 或上传到对象存储后的相对路径。建议使用透明底的 PNG 或 SVG 格式。</div>
            </div>
            <div class="setting-action">
              <el-input v-model="formData['sys.site.logo']" placeholder="/logo.png" size="large" />
            </div>
          </div>
        </div>

        <div class="setting-card" v-show="activeTab === 'theme'">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">平台主色调 (Primary Color)</div>
              <div class="setting-desc">覆盖全站的按钮、标签、激活态菜单等核心交互元素的颜色。</div>
            </div>
            <div class="setting-action">
              <el-color-picker v-model="themeColor" @change="handleThemeChange" size="large" />
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">强制深色模式 (Dark Mode)</div>
              <div class="setting-desc">开启后全站界面将立即切换至黑色背景，适合指挥大屏或夜间监控环境使用。</div>
            </div>
            <div class="setting-action">
              <el-switch v-model="isDark" @change="toggleDark" size="large" />
            </div>
          </div>
        </div>

        <div class="setting-card" v-show="activeTab === 'map'">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">地图底图供应商</div>
              <div class="setting-desc">选择用于管网拓扑、巡检轨迹等模块的 2D/3D 瓦片地图服务商。</div>
            </div>
            <div class="setting-action">
              <el-select v-model="formData['sys.map.source']" placeholder="选择地图底层" size="large" style="width: 100%;">
                <el-option label="高德地图 (Amap)" value="amap" />
                <el-option label="百度地图 (Baidu)" value="baidu" />
                <el-option label="天地图 (Tianditu)" value="tianditu" />
                <el-option label="离线内网自建瓦片服务" value="offline" />
              </el-select>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">默认中心坐标 (Center Point)</div>
              <div class="setting-desc">初始化地图时视角的默认聚焦位置经纬度。</div>
            </div>
            <div class="setting-action">
              <el-input v-model="formData['sys.map.center']" placeholder="[118.67, 24.87]" size="large" />
            </div>
          </div>
        </div>

        <div class="setting-card" v-show="activeTab === 'notification'">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">报警邮件发件服务器 (SMTP)</div>
              <div class="setting-desc">当产生致命级报警时，系统用于对外下发通知邮件的通道配置。</div>
            </div>
            <div class="setting-action">
              <el-input v-model="formData['sys.mail.smtp']" placeholder="如：smtp.exmail.qq.com" size="large" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, Check, Brush, Location, Message } from '@element-plus/icons-vue';
import { getGlobalConfig, batchUpdateConfig } from '@/api/system/config';
import { useConfigStore } from '@/store/config';

const formData = ref<Record<string, string>>({});
const configStore = useConfigStore();
const activeTab = ref('basic');

// 主题与深色模式相关
const themeColor = ref(localStorage.getItem('theme-color') || '#3b82f6');
const isDark = ref(localStorage.getItem('theme-dark') === 'true' || document.documentElement.classList.contains('dark'));

const toggleDark = (val: boolean) => {
  formData.value['sys.ui.is_dark'] = val ? 'true' : 'false';
  if (val) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme-dark', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme-dark', 'false');
  }
};

// 动态修改 Element Plus 主题色及相关的混入变量
const handleThemeChange = (color: string) => {
  if (!color) return;
  formData.value['sys.ui.theme_color'] = color;
  document.documentElement.style.setProperty('--el-color-primary', color);
  
  // 简易生成 light/dark 变体（实际工程中可以使用 color mix 或 tinycolor2 库，这里仅作基础混色演示）
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `color-mix(in srgb, ${color}, white ${i * 10}%)`);
  }
  document.documentElement.style.setProperty('--el-color-primary-dark-2', `color-mix(in srgb, ${color}, black 20%)`);
  
  localStorage.setItem('theme-color', color);
};

// 页面加载时获取全量配置
const fetchConfig = async () => {
  try {
    const res = await getGlobalConfig();
    if (res) {
      formData.value = res as unknown as Record<string, string>;
      if (formData.value['sys.ui.theme_color']) {
        themeColor.value = formData.value['sys.ui.theme_color'];
      }
      if (formData.value['sys.ui.is_dark']) {
        isDark.value = formData.value['sys.ui.is_dark'] === 'true';
      }
    }
  } catch (error) {
    console.error('获取配置失败:', error);
  }
};

onMounted(() => {
  fetchConfig();
});

// 批量保存并通知全局状态更新
const handleBatchSave = async () => {
  try {
    // 转换为后端需要的批量格式
    const payload = Object.keys(formData.value).map(key => ({
      configKey: key,
      configValue: formData.value[key]
    }));

    await batchUpdateConfig(payload);
    ElMessage.success('保存成功，全局配置已动态生效');
    
    // 触发 Pinia 更新内存状态，UI 会自动响应式刷新
    await configStore.fetchGlobalConfig();
  } catch (error) {
    ElMessage.error('保存失败');
  }
};
</script>


<style scoped>
.config-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-layout {
  display: flex;
  height: 100%;
  background: var(--el-bg-color);
}

.settings-sidebar {
  width: 240px;
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 24px;
  padding-left: 8px;
}

.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: var(--el-fill-color-light);
}

.nav-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

html.dark .nav-item.active {
  background: var(--el-color-primary-dark-2);
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
}

.settings-content {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.section-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.setting-card {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-info {
  flex: 1;
  padding-right: 40px;
}

.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.setting-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.setting-action {
  width: 300px;
  display: flex;
  justify-content: flex-end;
}
</style>

