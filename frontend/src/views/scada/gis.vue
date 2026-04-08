<template>
  <div class="gis-container">
    <!-- Map Container -->
    <div id="map" class="map-layer"></div>

    <!-- Floating Header -->
    <div class="gis-header fade-in-down">
      <div class="brand">
        <el-icon class="brand-icon"><Location /></el-icon>
        <h2>Geo-Spatial Intelligence (GIS)</h2>
        <span class="badge">Real-Time</span>
      </div>
      <div class="actions">
        <el-button type="primary" @click="resetView" plain>
          <el-icon><Refresh /></el-icon> Reset View
        </el-button>
      </div>
    </div>

    <!-- Floating Sidebar (Glassmorphism) -->
    <div class="gis-sidebar fade-in-left">
      <div class="panel-section">
        <h3>Network Assets</h3>
        <p class="desc">Toggle visibility of infrastructure layers.</p>
        <div class="layer-toggles">
          <label class="toggle-item" :class="{ active: layers.pump }">
            <input type="checkbox" v-model="layers.pump" @change="updateLayers" />
            <span class="dot pump-dot"></span> Pump Stations
          </label>
          <label class="toggle-item" :class="{ active: layers.pressure }">
            <input type="checkbox" v-model="layers.pressure" @change="updateLayers" />
            <span class="dot pressure-dot"></span> Pressure Nodes
          </label>
          <label class="toggle-item" :class="{ active: layers.pipe }">
            <input type="checkbox" v-model="layers.pipe" @change="updateLayers" />
            <span class="line-icon"></span> Main Pipelines
          </label>
          <label class="toggle-item" :class="{ active: layers.alarm }">
            <input type="checkbox" v-model="layers.alarm" @change="updateLayers" />
            <span class="dot alarm-dot"></span> Active Alarms
          </label>
        </div>
      </div>

      <div class="panel-section">
        <h3>Critical Assets Directory</h3>
        <div class="search-box">
          <el-input v-model="searchQuery" placeholder="Search asset ID or name..." prefix-icon="Search" />
        </div>
        <div class="asset-list">
          <div 
            v-for="asset in filteredAssets" 
            :key="asset.id" 
            class="asset-card"
            @click="focusAsset(asset)"
          >
            <div class="asset-icon" :class="asset.type">
              <el-icon v-if="asset.type === 'pump'"><Connection /></el-icon>
              <el-icon v-else-if="asset.type === 'alarm'"><Warning /></el-icon>
              <el-icon v-else><Odometer /></el-icon>
            </div>
            <div class="asset-info">
              <h4>{{ asset.name }}</h4>
              <span class="status" :class="asset.status">{{ asset.statusText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, shallowRef } from 'vue';
import { Location, Refresh, Search, Connection, Odometer, Warning } from '@element-plus/icons-vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Layer state
const layers = ref({
  pump: true,
  pressure: true,
  pipe: true,
  alarm: true
});

const searchQuery = ref('');
const map = shallowRef<L.Map | null>(null);

// Layer Groups
const pumpGroup = shallowRef<L.LayerGroup | null>(null);
const pressureGroup = shallowRef<L.LayerGroup | null>(null);
const pipeGroup = shallowRef<L.LayerGroup | null>(null);
const alarmGroup = shallowRef<L.LayerGroup | null>(null);

// Dummy Data
const assets = ref([
  { id: 'P01', name: 'Zhangjiang Main Pump Station', type: 'pump', lat: 31.213, lng: 121.595, status: 'normal', statusText: 'Online • 320 kPa' },
  { id: 'P02', name: 'Jinqiao Booster Station', type: 'pump', lat: 31.250, lng: 121.610, status: 'normal', statusText: 'Online • 280 kPa' },
  { id: 'N01', name: 'Node A - Chuansha', type: 'pressure', lat: 31.190, lng: 121.650, status: 'normal', statusText: 'Stable • 0.3 MPa' },
  { id: 'N02', name: 'Node B - Lujiazui', type: 'pressure', lat: 31.235, lng: 121.505, status: 'normal', statusText: 'Stable • 0.35 MPa' },
  { id: 'A01', name: 'Pipeline Leak Suspected', type: 'alarm', lat: 31.220, lng: 121.540, status: 'critical', statusText: 'Pressure Drop -15%' },
  { id: 'A02', name: 'Valve V-34 Offline', type: 'alarm', lat: 31.205, lng: 121.580, status: 'warning', statusText: 'Telemetry Lost' },
]);

const pipelines = [
  [[31.213, 121.595], [31.205, 121.580], [31.190, 121.650]], // Route 1
  [[31.213, 121.595], [31.220, 121.540], [31.235, 121.505]], // Route 2
  [[31.235, 121.505], [31.250, 121.610]] // Route 3
];

const filteredAssets = computed(() => {
  return assets.value.filter(a => {
    if (!layers.value[a.type as keyof typeof layers.value]) return false;
    if (searchQuery.value && !a.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;
    return true;
  });
});

const initMap = () => {
  // Initialize map centered at Shanghai Pudong area
  map.value = L.map('map', {
    center: [31.220, 121.580],
    zoom: 13,
    zoomControl: false,
    attributionControl: false
  });

  // Dark Industrial Map Tiles (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map.value);

  // Custom Controls
  L.control.zoom({ position: 'bottomright' }).addTo(map.value);

  // Initialize Groups
  pumpGroup.value = L.layerGroup().addTo(map.value);
  pressureGroup.value = L.layerGroup().addTo(map.value);
  pipeGroup.value = L.layerGroup().addTo(map.value);
  alarmGroup.value = L.layerGroup().addTo(map.value);

  renderLayers();
};

const renderLayers = () => {
  // Clear existing
  pumpGroup.value?.clearLayers();
  pressureGroup.value?.clearLayers();
  pipeGroup.value?.clearLayers();
  alarmGroup.value?.clearLayers();

  // Render Pipes
  pipelines.forEach(path => {
    const polyline = L.polyline(path as L.LatLngExpression[], { 
      color: '#00d8ff', 
      weight: 3, 
      opacity: 0.6,
      dashArray: '5, 10',
      lineCap: 'round'
    });
    polyline.bindTooltip('Main Trunk Line M-01', { className: 'industrial-tooltip', direction: 'top' });
    pipeGroup.value?.addLayer(polyline);
  });

  // Render Markers
  assets.value.forEach(asset => {
    let color = '#00d8ff'; // default blue for pumps
    if (asset.type === 'pressure') color = '#10b981'; // green
    if (asset.type === 'alarm' && asset.status === 'critical') color = '#ef4444'; // red
    if (asset.type === 'alarm' && asset.status === 'warning') color = '#f59e0b'; // yellow

    const markerHtml = `
      <div class="custom-marker" style="background-color: ${color}; box-shadow: 0 0 15px ${color}">
        <div class="pulse-ring" style="border-color: ${color}"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: 'dummy-class-to-override-default',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([asset.lat, asset.lng], { icon });

    const popupHtml = `
      <div class="industrial-popup">
        <h4>${asset.name}</h4>
        <div class="divider"></div>
        <p><strong>ID:</strong> ${asset.id}</p>
        <p><strong>Type:</strong> ${asset.type.toUpperCase()}</p>
        <p><strong>Status:</strong> <span style="color:${color}">${asset.statusText}</span></p>
        <p><strong>Coordinates:</strong> ${asset.lat.toFixed(3)}, ${asset.lng.toFixed(3)}</p>
      </div>
    `;

    marker.bindPopup(popupHtml, { className: 'dark-popup-wrapper' });

    if (asset.type === 'pump') pumpGroup.value?.addLayer(marker);
    if (asset.type === 'pressure') pressureGroup.value?.addLayer(marker);
    if (asset.type === 'alarm') alarmGroup.value?.addLayer(marker);
  });
};

const updateLayers = () => {
  if (!map.value) return;
  
  if (layers.value.pump) map.value.addLayer(pumpGroup.value!);
  else map.value.removeLayer(pumpGroup.value!);

  if (layers.value.pressure) map.value.addLayer(pressureGroup.value!);
  else map.value.removeLayer(pressureGroup.value!);

  if (layers.value.pipe) map.value.addLayer(pipeGroup.value!);
  else map.value.removeLayer(pipeGroup.value!);

  if (layers.value.alarm) map.value.addLayer(alarmGroup.value!);
  else map.value.removeLayer(alarmGroup.value!);
};

const focusAsset = (asset: any) => {
  if (map.value) {
    map.value.flyTo([asset.lat, asset.lng], 16, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }
};

const resetView = () => {
  if (map.value) {
    map.value.flyTo([31.220, 121.580], 13);
  }
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<style>
/* Global Leaflet Overrides for Dark Theme */
.leaflet-container {
  background: #020617 !important;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}
.dark-popup-wrapper .leaflet-popup-content-wrapper {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 216, 255, 0.2);
  color: #f8fafc;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}
.dark-popup-wrapper .leaflet-popup-tip {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(0, 216, 255, 0.2);
}
.dark-popup-wrapper .leaflet-popup-close-button {
  color: #94a3b8 !important;
}
.industrial-popup {
  padding: 16px;
}
.industrial-popup h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #00d8ff;
  letter-spacing: 0.5px;
}
.industrial-popup .divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(0,216,255,0.3), transparent);
  margin-bottom: 12px;
}
.industrial-popup p {
  margin: 6px 0;
  font-size: 13px;
  color: #cbd5e1;
}
.industrial-popup strong {
  color: #94a3b8;
  display: inline-block;
  width: 80px;
}
.industrial-tooltip {
  background: rgba(2, 6, 23, 0.8);
  border: 1px solid #1e293b;
  color: #e2e8f0;
  font-family: monospace;
  font-size: 12px;
}

/* Custom Marker Animations */
.custom-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  z-index: 10;
  border: 2px solid #fff;
}
.pulse-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid;
  border-radius: 50%;
  animation: map-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 1;
}
@keyframes map-pulse {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
</style>

<style scoped>
.gis-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px); /* Adjust based on your layout header */
  background: #020617;
  overflow: hidden;
}

.map-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Floating Header */
.gis-header {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none; /* Let clicks pass through */
}

.gis-header .actions {
  pointer-events: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
}

.brand-icon {
  font-size: 24px;
  color: #00d8ff;
}

.brand h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Floating Sidebar */
.gis-sidebar {
  position: absolute;
  top: 96px;
  left: 24px;
  bottom: 24px;
  width: 340px;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  overflow: hidden;
}

.panel-section {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.panel-section:last-child {
  border-bottom: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

h3 {
  margin: 0 0 4px 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 600;
}

.desc {
  margin: 0 0 16px 0;
  color: #64748b;
  font-size: 13px;
}

.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}
.toggle-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}
.toggle-item.active {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}
.toggle-item input {
  display: none;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.pump-dot { background: #00d8ff; box-shadow: 0 0 8px #00d8ff; }
.pressure-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
.alarm-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

.line-icon {
  width: 14px;
  height: 3px;
  background: #00d8ff;
  opacity: 0.8;
}

.search-box {
  margin-top: 12px;
  margin-bottom: 16px;
}
:deep(.el-input__wrapper) {
  background-color: rgba(2, 6, 23, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #f8fafc;
}

.asset-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}
.asset-list::-webkit-scrollbar {
  width: 4px;
}
.asset-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.asset-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.asset-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
  border-color: rgba(255, 255, 255, 0.1);
}

.asset-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.asset-icon.pump { background: rgba(0, 216, 255, 0.1); color: #00d8ff; }
.asset-icon.pressure { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.asset-icon.alarm { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.asset-info h4 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #f8fafc;
  font-weight: 500;
}

.asset-info .status {
  font-size: 11px;
  font-family: monospace;
}
.status.normal { color: #10b981; }
.status.warning { color: #f59e0b; }
.status.critical { color: #ef4444; }

/* Animations */
.fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-in-left {
  animation: fadeInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
