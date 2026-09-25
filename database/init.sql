CREATE TABLE IF NOT EXISTS warehouse (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128),
  district VARCHAR(64),
  address VARCHAR(255),
  manager_id VARCHAR(64),
  capacity_level INT,
  contact_phone VARCHAR(32),
  status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS supply_item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku_code VARCHAR(64),
  name VARCHAR(128),
  category VARCHAR(32),
  unit VARCHAR(16),
  safety_stock INT,
  expire_days INT,
  storage_requirement VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS inventory_batch (
  id INT PRIMARY KEY AUTO_INCREMENT,
  warehouse_id INT,
  supply_item_id INT,
  batch_no VARCHAR(64),
  quantity INT,
  expire_at VARCHAR(32),
  inbound_source VARCHAR(255),
  quality_status VARCHAR(32)
);

-- 移库单：仓库间借调物资。提交即冻结来源批次，目标仓确认收货后才转入库存
CREATE TABLE IF NOT EXISTS transfer_order (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transfer_no VARCHAR(32),       -- 移库单号 YK+日期+序号
  source_warehouse_id INT,       -- 来源仓
  target_warehouse_id INT,       -- 目标仓
  supply_item_id INT,            -- 物资
  batch_no VARCHAR(64),          -- 批次号（来源/目标共用）
  quantity INT,                  -- 移库数量
  status VARCHAR(16),            -- IN_TRANSIT 在途 / POSTED 已入账
  created_by VARCHAR(64),        -- 经办仓库员
  created_at VARCHAR(32),
  received_at VARCHAR(32),
  source_batch_id INT,           -- 冻结的来源批次
  target_batch_id INT,           -- 收货后入账的目标批次
  source_quantity_snapshot INT,  -- 提交时来源批次实际库存快照（收货乐观锁）
  frozen_total_snapshot INT,     -- 提交时该批次在途冻结总量快照（含本单）
  remark VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS shelter (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128),
  district VARCHAR(64),
  capacity INT,
  current_population INT,
  contact_person VARCHAR(64),
  risk_level VARCHAR(16),
  open_status VARCHAR(16)
);

CREATE TABLE IF NOT EXISTS dispatch_order (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT,
  source_warehouse_id INT,
  shelter_id INT,
  priority VARCHAR(16),
  status VARCHAR(32),
  requested_by VARCHAR(64),
  approved_by VARCHAR(64),
  dispatched_at VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(255),
  target_type VARCHAR(32),
  target_id VARCHAR(64),
  created_at VARCHAR(32)
);

-- 同一来源批次同时只允许一张在途移库单（业务层兜底，DB 层对来源批次+状态建索引）
CREATE INDEX idx_transfer_source_batch_status
  ON transfer_order (source_batch_id, status);
