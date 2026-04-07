/**
 * 工业边缘网关模拟器 (Edge Gateway Simulator)
 * 1. 启动一个本地轻量级 MQTT Broker (使用 aedes)
 * 2. 定时向 Broker 发布虚拟 PLC / 传感器的遥测数据 (JSON 格式)
 */
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const mqtt = require('mqtt');

const PORT = 1883;

// 1. 启动内部 MQTT Broker
server.listen(PORT, function () {
  console.log(`[MQTT Broker] 启动成功，监听端口: ${PORT}`);
  startSimulatedDevices();
});

// 监听客户端连接
aedes.on('client', function (client) {
  console.log(`[MQTT Broker] 客户端已连接: ${client ? client.id : client}`);
});

// 监听客户端断开
aedes.on('clientDisconnect', function (client) {
  console.log(`[MQTT Broker] 客户端已断开: ${client ? client.id : client}`);
});

// 2. 模拟边缘设备数据上报
function startSimulatedDevices() {
  const client = mqtt.connect(`mqtt://localhost:${PORT}`, {
    clientId: 'edge_gateway_001',
    clean: true,
  });

  client.on('connect', () => {
    console.log('[Edge Gateway] 模拟网关已连接至 Broker，开始定时上报数据...');

    setInterval(() => {
      // 模拟 1号水厂的数据 (对应我们在 iot_tag_mapping 里可能配置的 tag)
      const device1Data = {
        device_id: 1,
        timestamp: Date.now(),
        data: {
          'PLC.S7.Temp': (20 + Math.random() * 5).toFixed(2),      // 温度 20~25
          'PLC.S7.Pressure': (0.3 + Math.random() * 0.1).toFixed(3), // 压力 0.3~0.4
          'PLC.S7.FlowRate': (150 + Math.random() * 50).toFixed(1),  // 瞬时流量 150~200
        }
      };

      // 模拟 2号泵站的数据
      const device2Data = {
        device_id: 2,
        timestamp: Date.now(),
        data: {
          'Pump.Status': Math.random() > 0.1 ? 1 : 0,                // 90% 概率运行
          'Pump.Freq': (45 + Math.random() * 5).toFixed(1),          // 频率 45~50 Hz
          'Pump.Power': (30 + Math.random() * 2).toFixed(1),         // 功率 30~32 kW
        }
      };

      // 发送到对应的 MQTT Topic
      client.publish(`telemetry/devices/1/data`, JSON.stringify(device1Data));
      client.publish(`telemetry/devices/2/data`, JSON.stringify(device2Data));

      console.log(`[Edge Gateway] 已上报数据 (Device 1 & 2) - ${new Date().toISOString()}`);
    }, 5000); // 每 5 秒上报一次
  });

  client.on('error', (err) => {
    console.error('[Edge Gateway] 模拟网关连接错误:', err);
  });
}
