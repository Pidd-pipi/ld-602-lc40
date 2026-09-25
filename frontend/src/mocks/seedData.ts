export const mockData = {
  "warehouse": [
    {
      "id": 1,
      "name": "海淀中央应急仓",
      "district": "海淀区",
      "address": "中关村应急基地 1 号库",
      "manager_id": 1,
      "capacity_level": 5000,
      "contact_phone": "13800000001",
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "name": "朝阳分仓",
      "district": "朝阳区",
      "address": "CBD 救灾物资储备库",
      "manager_id": 2,
      "capacity_level": 3000,
      "contact_phone": "13800000002",
      "status": "ACTIVE"
    },
    {
      "id": 3,
      "name": "丰台分仓",
      "district": "丰台区",
      "address": "南三环应急物资中转站",
      "manager_id": 3,
      "capacity_level": 2000,
      "contact_phone": "13800000003",
      "status": "STANDBY"
    }
  ],
  "supplyItem": [
    {
      "id": 1,
      "sku_code": "WATER-550ML",
      "name": "瓶装饮用水 550ml",
      "category": "WATER",
      "unit": "瓶",
      "safety_stock": "100",
      "expire_days": 720,
      "storage_requirement": "常温避光",
    },
    {
      "id": 2,
      "sku_code": "MED-KIT-01",
      "name": "综合急救包",
      "category": "MEDICAL",
      "unit": "个",
      "safety_stock": "30",
      "expire_days": 1095,
      "storage_requirement": "干燥防潮",
    },
    {
      "id": 3,
      "sku_code": "TENT-12",
      "name": "12 平米救灾帐篷",
      "category": "SHELTER",
      "unit": "顶",
      "safety_stock": "10",
      "expire_days": 1825,
      "storage_requirement": "垫高存放",
    }
  ],
  "inventoryBatch": [
    {
      "id": 1,
      "warehouse_id": 1,
      "supply_item_id": 1,
      "batch_no": "B20260501-W",
      "quantity": 120,
      "expire_at": "2027-05-01T09:00:00Z",
      "inbound_source": "市级采购入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 2,
      "warehouse_id": 1,
      "supply_item_id": 1,
      "batch_no": "B20260415-W",
      "quantity": 60,
      "expire_at": "2026-12-15T09:00:00Z",
      "inbound_source": "社会捐赠",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 3,
      "warehouse_id": 2,
      "supply_item_id": 1,
      "batch_no": "B20260510-W",
      "quantity": 40,
      "expire_at": "2027-05-10T09:00:00Z",
      "inbound_source": "市级采购入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 4,
      "warehouse_id": 1,
      "supply_item_id": 2,
      "batch_no": "B20260301-M",
      "quantity": 30,
      "expire_at": "2029-03-01T09:00:00Z",
      "inbound_source": "卫健调拨入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 5,
      "warehouse_id": 2,
      "supply_item_id": 2,
      "batch_no": "B20260320-M",
      "quantity": 20,
      "expire_at": "2029-03-20T09:00:00Z",
      "inbound_source": "卫健调拨入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 6,
      "warehouse_id": 1,
      "supply_item_id": 3,
      "batch_no": "B20260110-S",
      "quantity": 15,
      "expire_at": "2031-01-10T09:00:00Z",
      "inbound_source": "省级调拨入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 7,
      "warehouse_id": 3,
      "supply_item_id": 3,
      "batch_no": "B20260210-S",
      "quantity": 10,
      "expire_at": "2031-02-10T09:00:00Z",
      "inbound_source": "省级调拨入库",
      "quality_status": "QUALIFIED"
    },
    {
      "id": 8,
      "warehouse_id": 3,
      "supply_item_id": 1,
      "batch_no": "B20260520-W",
      "quantity": 25,
      "expire_at": "2027-05-20T09:00:00Z",
      "inbound_source": "区级采购入库",
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
      "open_status": "SUBMITTED"
    },
    {
      "id": 2,
      "name": "name 2",
      "district": "district 2",
      "capacity": 104,
      "current_population": 104,
      "contact_person": "contact person 2",
      "risk_level": "MEDIUM",
      "open_status": "APPROVED"
    },
    {
      "id": 3,
      "name": "name 3",
      "district": "district 3",
      "capacity": 116,
      "current_population": 116,
      "contact_person": "contact person 3",
      "risk_level": "HIGH",
      "open_status": "DRAFT"
    }
  ],
  "dispatchOrder": [
    {
      "id": 1,
      "event_id": 1,
      "source_warehouse_id": 1,
      "shelter_id": 1,
      "priority": "priority 1",
      "status": "SUBMITTED",
      "requested_by": "requested by 1",
      "approved_by": "approved by 1",
      "dispatched_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "event_id": 2,
      "source_warehouse_id": 2,
      "shelter_id": 2,
      "priority": "priority 2",
      "status": "APPROVED",
      "requested_by": "requested by 2",
      "approved_by": "approved by 2",
      "dispatched_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "event_id": 3,
      "source_warehouse_id": 3,
      "shelter_id": 3,
      "priority": "priority 3",
      "status": "DRAFT",
      "requested_by": "requested by 3",
      "approved_by": "approved by 3",
      "dispatched_at": "2026-06-13T09:00:00Z"
    }
  ],
  "transferOrder": [
    {
      "id": 1,
      "transfer_no": "TK20260920001",
      "source_warehouse_id": 1,
      "target_warehouse_id": 2,
      "status": "IN_TRANSIT",
      "created_by": "仓库员-赵磊",
      "remark": "朝阳分仓防汛演练补货",
      "lines": [
        {
          "id": 1,
          "inventory_batch_id": 1,
          "supply_item_id": 1,
          "batch_no": "B20260501-W",
          "quantity": 20,
          "source_quantity_snapshot": 120,
          "frozen_quantity_snapshot": 20
        }
      ],
      "created_at": "2026-09-20T08:30:00Z",
      "shipped_at": "2026-09-20T08:30:00Z",
      "received_at": ""
    }
  ]
} as const;
