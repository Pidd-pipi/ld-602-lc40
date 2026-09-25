export const mockData = {
  "warehouse": [
    {
      "id": 1,
      "name": "城东应急中心仓",
      "district": "东城区",
      "address": "东城区防汛路 18 号",
      "manager_id": 101,
      "capacity_level": 800,
      "contact_phone": "0571-88000001",
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "name": "城西应急储备仓",
      "district": "西城区",
      "address": "西城区救灾巷 6 号",
      "manager_id": 102,
      "capacity_level": 500,
      "contact_phone": "0571-88000002",
      "status": "ACTIVE"
    },
    {
      "id": 3,
      "name": "城南应急前置仓",
      "district": "南城区",
      "address": "南城区防风大道 122 号",
      "manager_id": 103,
      "capacity_level": 600,
      "contact_phone": "0571-88000003",
      "status": "ACTIVE"
    }
  ],
  "supplyItem": [
    {
      "id": 1,
      "sku_code": "SKU-WATER-01",
      "name": "瓶装饮用水(550ml×24)",
      "category": "WATER",
      "unit": "箱",
      "safety_stock": "100",
      "expire_days": 730,
      "storage_requirement": "常温避光"
    },
    {
      "id": 2,
      "sku_code": "SKU-FOOD-01",
      "name": "压缩干粮",
      "category": "FOOD",
      "unit": "箱",
      "safety_stock": "80",
      "expire_days": 540,
      "storage_requirement": "防潮存放"
    },
    {
      "id": 3,
      "sku_code": "SKU-MED-01",
      "name": "医用急救包",
      "category": "MEDICAL",
      "unit": "个",
      "safety_stock": "50",
      "expire_days": 1095,
      "storage_requirement": "阴凉干燥"
    },
    {
      "id": 4,
      "sku_code": "SKU-TOOL-01",
      "name": "液压破拆工具组",
      "category": "RESCUE_TOOL",
      "unit": "套",
      "safety_stock": "10",
      "expire_days": 1825,
      "storage_requirement": "常规机具库位"
    }
  ],
  "inventoryBatch": [
    {
      "id": 1,
      "warehouse_id": 1,
      "supply_item_id": 1,
      "batch_no": "PC20260301",
      "quantity": 300,
      "expire_at": "2028-03-01T09:00:00Z",
      "inbound_source": "市级应急物资采购",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 2,
      "warehouse_id": 1,
      "supply_item_id": 2,
      "batch_no": "GB20260215",
      "quantity": 120,
      "expire_at": "2027-08-15T09:00:00Z",
      "inbound_source": "城南应急前置仓移库入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 3,
      "warehouse_id": 1,
      "supply_item_id": 3,
      "batch_no": "JJ20260110",
      "quantity": 60,
      "expire_at": "2029-01-10T09:00:00Z",
      "inbound_source": "红十字会捐赠",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 4,
      "warehouse_id": 2,
      "supply_item_id": 1,
      "batch_no": "PC20260410",
      "quantity": 80,
      "expire_at": "2028-04-10T09:00:00Z",
      "inbound_source": "市级应急物资采购",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 5,
      "warehouse_id": 2,
      "supply_item_id": 4,
      "batch_no": "PC20251220",
      "quantity": 6,
      "expire_at": "2030-12-20T09:00:00Z",
      "inbound_source": "省级装备调拨",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 6,
      "warehouse_id": 3,
      "supply_item_id": 2,
      "batch_no": "GB20260215",
      "quantity": 200,
      "expire_at": "2027-08-15T09:00:00Z",
      "inbound_source": "区级物资采购",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 7,
      "warehouse_id": 3,
      "supply_item_id": 3,
      "batch_no": "JJ20260110",
      "quantity": 30,
      "expire_at": "2029-01-10T09:00:00Z",
      "inbound_source": "市级应急物资采购",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 8,
      "warehouse_id": 3,
      "supply_item_id": 1,
      "batch_no": "PC20260301",
      "quantity": 100,
      "expire_at": "2028-03-01T09:00:00Z",
      "inbound_source": "城东应急中心仓移库入库",
      "quality_status": "QUALIFIED"
    }
  ],
  "shelter": [
    {
      "id": 1,
      "name": "name 1",
      "district": "district 1",
      "capacity": 92,
      "current_population": 92,
      "contact_person": "contact person 1",
      "risk_level": "LOW",
      "open_status": "STANDBY"
    },
    {
      "id": 2,
      "name": "name 2",
      "district": "district 2",
      "capacity": 104,
      "current_population": 104,
      "contact_person": "contact person 2",
      "risk_level": "MEDIUM",
      "open_status": "OPEN"
    },
    {
      "id": 3,
      "name": "name 3",
      "district": "district 3",
      "capacity": 116,
      "current_population": 116,
      "contact_person": "contact person 3",
      "risk_level": "HIGH",
      "open_status": "CLOSED"
    }
  ],
  "dispatchOrder": [
    {
      "id": 1,
      "event_id": 1,
      "source_warehouse_id": 1,
      "shelter_id": 1,
      "priority": "HIGH",
      "status": "RECEIVED",
      "requested_by": "街道值班室",
      "approved_by": "区应急局",
      "dispatched_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 2,
      "event_id": 2,
      "source_warehouse_id": 2,
      "shelter_id": 2,
      "priority": "MEDIUM",
      "status": "APPROVED",
      "requested_by": "社区网格员",
      "approved_by": "区应急局",
      "dispatched_at": null
    }
  ],
  "transferOrder": [
    {
      "id": 1,
      "transfer_no": "YK20260918001",
      "source_warehouse_id": 3,
      "target_warehouse_id": 1,
      "supply_item_id": 2,
      "batch_no": "GB20260215",
      "quantity": 50,
      "status": "POSTED",
      "created_by": "仓库员-王磊",
      "created_at": "2026-09-18T08:30:00Z",
      "received_at": "2026-09-18T14:10:00Z",
      "source_batch_id": 6,
      "target_batch_id": 2,
      "source_quantity_snapshot": 250,
      "frozen_total_snapshot": 50,
      "remark": "台风预警前补充城东干粮储备"
    },
    {
      "id": 2,
      "transfer_no": "YK20260922002",
      "source_warehouse_id": 1,
      "target_warehouse_id": 2,
      "supply_item_id": 3,
      "batch_no": "JJ20260110",
      "quantity": 20,
      "status": "IN_TRANSIT",
      "created_by": "仓库员-王磊",
      "created_at": "2026-09-22T10:05:00Z",
      "received_at": null,
      "source_batch_id": 3,
      "target_batch_id": null,
      "source_quantity_snapshot": 60,
      "frozen_total_snapshot": 20,
      "remark": "城西演练医疗物资补充"
    },
    {
      "id": 3,
      "transfer_no": "YK20260915003",
      "source_warehouse_id": 1,
      "target_warehouse_id": 3,
      "supply_item_id": 1,
      "batch_no": "PC20260301",
      "quantity": 100,
      "status": "POSTED",
      "created_by": "仓库员-王磊",
      "created_at": "2026-09-15T09:00:00Z",
      "received_at": "2026-09-15T16:40:00Z",
      "source_batch_id": 1,
      "target_batch_id": 8,
      "source_quantity_snapshot": 400,
      "frozen_total_snapshot": 100,
      "remark": "城南前置仓饮水补给"
    }
  ]
} as const;
