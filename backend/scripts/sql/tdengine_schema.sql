-- ==============================================================
-- TDengine 3.3.8+ 时序库表结构与流计算
-- 参考: /.trae/rules/Database_Schema_Design.md
-- ==============================================================

-- 1. 建库 (数据库名需与环境变量中的 TDENGINE_DATABASE 一致，默认为 dma)
CREATE DATABASE IF NOT EXISTS dma KEEP 365 REPLICA 1;
USE dma;

-- 2. 关系表（仅用于时序辅助，通常不在这里建，但根据用户要求保留）
CREATE TABLE IF NOT EXISTS device_info (ts TIMESTAMP, device_id VARCHAR(50), device_name VARCHAR(500), device_type TINYINT, install_addr VARCHAR(500), status TINYINT);

-- ====================== 超级表 ======================
-- 基础原始超级表
CREATE STABLE IF NOT EXISTS device_raw (ts TIMESTAMP, raw_value DOUBLE) TAGS (device_id VARCHAR(50), zone_id VARCHAR(30), device_type TINYINT);
CREATE STABLE IF NOT EXISTS user_raw (ts TIMESTAMP, raw_value DOUBLE) TAGS (user_id VARCHAR(50), zone_id VARCHAR(30), user_type TINYINT);

-- 衍生聚合超级表
CREATE STABLE IF NOT EXISTS device_5m (ts TIMESTAMP, raw_value DOUBLE, qcode TINYINT) TAGS (device_id VARCHAR(50), zone_id VARCHAR(30), device_type TINYINT);
CREATE STABLE IF NOT EXISTS device_daily (ts TIMESTAMP, daily_used DOUBLE) TAGS (device_id VARCHAR(50), zone_id VARCHAR(30), device_type TINYINT);
CREATE STABLE IF NOT EXISTS user_daily (ts TIMESTAMP, daily_used DOUBLE) TAGS (user_id VARCHAR(50), zone_id VARCHAR(30), user_type TINYINT);
CREATE STABLE IF NOT EXISTS dma_5m (ts TIMESTAMP, supply DOUBLE, sale DOUBLE, balance_value DOUBLE, night_flow DOUBLE) TAGS (zone_id VARCHAR(30));
CREATE STABLE IF NOT EXISTS dma_daily (ts TIMESTAMP, supply DOUBLE, sale DOUBLE, balance_value DOUBLE, night_flow DOUBLE) TAGS (zone_id VARCHAR(30));
CREATE STABLE IF NOT EXISTS dma_monthly (ts TIMESTAMP, supply DOUBLE, sale DOUBLE, balance_value DOUBLE) TAGS (zone_id VARCHAR(30));
CREATE STABLE IF NOT EXISTS dma_yearly (ts TIMESTAMP, supply DOUBLE, sale DOUBLE, balance_value DOUBLE) TAGS (zone_id VARCHAR(30));

-- ====================== 流计算 (Stream Computing) ======================
-- 1. 设备 5 分钟均值降采样
CREATE STREAM IF NOT EXISTS stream_device_5m
INTERVAL(5m) SLIDING(5m) FROM device_raw
PARTITION BY device_id, zone_id, device_type
STREAM_OPTIONS(WATERMARK(10s) | MAX_DELAY(5s) | IGNORE_DISORDER)
INTO device_5m
AS SELECT
  _wstart AS ts,
  AVG(raw_value) AS raw_value,
  CAST(0 AS TINYINT) AS qcode
FROM device_raw
PARTITION BY device_id, zone_id, device_type
INTERVAL(5m);

-- 2. DMA 5 分钟供水
CREATE STREAM IF NOT EXISTS stream_dma_5m
INTERVAL(5m) SLIDING(5m) FROM device_5m
PARTITION BY zone_id
STREAM_OPTIONS(WATERMARK(10s) | MAX_DELAY(5s) | IGNORE_DISORDER)
INTO dma_5m
AS SELECT
  _wstart AS ts,
  SUM(raw_value) AS supply,
  CAST(0 AS DOUBLE) AS sale,
  CAST(0 AS DOUBLE) AS balance_value,
  CAST(0 AS DOUBLE) AS night_flow
FROM device_5m
PARTITION BY zone_id
INTERVAL(5m);

-- 3. DMA 日供水
CREATE STREAM IF NOT EXISTS stream_dma_daily_supply
INTERVAL(1d) SLIDING(1d) FROM dma_5m
PARTITION BY zone_id
STREAM_OPTIONS(WATERMARK(1m) | MAX_DELAY(2m) | IGNORE_DISORDER)
INTO dma_daily
AS SELECT
  _wstart AS ts,
  SUM(supply) AS supply,
  CAST(0 AS DOUBLE) AS sale,
  CAST(0 AS DOUBLE) AS balance_value,
  CAST(0 AS DOUBLE) AS night_flow
FROM dma_5m
PARTITION BY zone_id
INTERVAL(1d);

-- 4. DMA 夜间最小流量 (MNF: 凌晨 2-4 点)
CREATE STREAM IF NOT EXISTS stream_dma_night
INTERVAL(1d) SLIDING(1d) FROM dma_5m
PARTITION BY zone_id
STREAM_OPTIONS(WATERMARK(1m) | MAX_DELAY(2m) | IGNORE_DISORDER)
INTO dma_daily
AS SELECT
  _wstart AS ts,
  CAST(0 AS DOUBLE) AS supply,
  CAST(0 AS DOUBLE) AS sale,
  CAST(0 AS DOUBLE) AS balance_value,
  MIN(supply) AS night_flow
FROM (
    SELECT supply, ts, zone_id
    FROM dma_5m
    WHERE CAST(ts AS BIGINT) % 86400000 >= 7200000 AND CAST(ts AS BIGINT) % 86400000 < 14400000
)
PARTITION BY zone_id
INTERVAL(1d);
