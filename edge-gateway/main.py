"""
边缘计算网关主入口 (Edge Gateway Main Entry)
模拟工业网关，向 MQTT Broker 定时推送设备遥测数据
"""

import time
import logging
import json
import random
import paho.mqtt.client as mqtt

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('EdgeGateway')

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
CLIENT_ID = "edge_gateway_01"

# 模拟设备配置 (1: METER_IN_01 进水表, 2: PUMP_01 变频泵)
devices = [
    {"id": 1, "type": "meter"},
    {"id": 2, "type": "pump"}
]

# 维护设备状态，用于模拟平滑变化
device_states = {
    1: {"flow_rate": 500.0, "pressure": 0.4},
    2: {"Pump.Status": 1, "Pump.Freq": 45.0, "Pump.Power": 15.0}
}

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info(f"Connected to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}")
        # 订阅反控指令主题
        client.subscribe("control/devices/#")
    else:
        logger.error(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    logger.info(f"Received control message on topic {msg.topic}: {msg.payload.decode()}")
    try:
        # topic: control/devices/{deviceId}/tag
        parts = msg.topic.split("/")
        if len(parts) == 4:
            device_id = int(parts[2])
            tag = parts[3]
            payload = json.loads(msg.payload.decode())
            new_value = payload.get("value")
            
            if device_id in device_states and tag in device_states[device_id]:
                device_states[device_id][tag] = new_value
                logger.info(f"Updated Device {device_id} Tag {tag} to {new_value}")
    except Exception as e:
        logger.error(f"Error parsing message: {e}")

def main():
    logger.info("Initializing Edge Gateway...")
    
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, CLIENT_ID)
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        logger.error(f"Cannot connect to broker: {e}")
        return

    client.loop_start()

    try:
        while True:
            # 更新并发布每个设备的遥测数据
            for dev in devices:
                dev_id = dev["id"]
                state = device_states[dev_id]
                
                # 模拟数据波动
                if dev["type"] == "meter":
                    state["flow_rate"] = max(0, state["flow_rate"] + random.uniform(-10, 10))
                    state["pressure"] = max(0, state["pressure"] + random.uniform(-0.02, 0.02))
                elif dev["type"] == "pump":
                    if state["Pump.Status"] == 1:
                        # 运行中，频率和功率有微小波动
                        # state["Pump.Freq"] keeps its target but wobbles
                        state["Pump.Power"] = (state["Pump.Freq"] / 50.0) * 15.0 + random.uniform(-0.5, 0.5)
                    else:
                        state["Pump.Freq"] = 0.0
                        state["Pump.Power"] = 0.0

                # 构造符合 payload 格式的消息
                payload = {
                    "timestamp": int(time.time() * 1000),
                    "data": state
                }
                
                topic = f"telemetry/devices/{dev_id}/data"
                client.publish(topic, json.dumps(payload))
                logger.debug(f"Published to {topic}: {payload}")

            time.sleep(2)
    except KeyboardInterrupt:
        logger.info("Gateway shutting down...")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
