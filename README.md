# 城市防灾应急物资调度系统

面向街道、社区和应急仓库的防灾物资储备与调拨平台，覆盖物资库存、避难点、事件响应、调拨审批，并支持**仓库间移库单（先冻结、收货再入账）**。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20102>（仓库库存页可发起移库、确认收货、查看移出/在途/已入账数量）

后端健康检查：<http://localhost:21102/health>

### 移库单接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/transfer-order` | 移库单列表（在途/已入账） |
| POST | `/api/transfer-order` | 提交移库单：来源数量立即冻结（校验库存与在途占用） |
| POST | `/api/transfer-order/{id}/receive` | 目标仓确认收货：复核来源账面/冻结快照后转入库存，不一致则停止入账 |

```bash
curl -X POST http://localhost:21102/api/transfer-order \
  -H 'Content-Type: application/json' \
  -d '{"source_warehouse_id":1,"target_warehouse_id":2,"created_by":"仓库员","remark":"防汛补货","lines":[{"inventory_batch_id":1,"supply_item_id":1,"batch_no":"B20260501-W","quantity":20}]}'

curl -X POST http://localhost:21102/api/transfer-order/1/receive
```

## 移库业务规则

1. **提交即冻结**：选择来源仓、目标仓和批次数量后提交，来源批次数量不立即扣减，而是按在途移库单累计为「冻结量」，可用数量 = 账面数量 − 在途冻结。
2. **库存不足**：`可用 < 申请数量` 时拒绝并提示「批次号、可用量、申请量」。
3. **同一批次在途互斥**：同一来源批次只要存在未收货的在途移库单，就不能再次发起，提示占用该批次的移库单号。
4. **收货先复核再入账**：确认收货时逐行比对提交时记录的「账面数量快照」「冻结数量快照」。只要来源账面数量或冻结数量发生变化，**整单停止入账**（不做部分入库），并提示变化前后的数值。
5. **入账动作**：复核通过后来源批次扣减数量；目标仓同批次优先合并数量，批次不存在则按原批次号新建转入批次，单据置为「已入账」。
6. 仓库页按批次与仓库两个维度展示：**移出、在途（冻结）、已入账转出、已入账转入、可用**。

> 离线评审（后端不可达）时前端自动回退到本地种子数据，并用 `localStorage` 持久化冻结/收货后的状态，刷新页面可复现。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。
  - 演示环境使用内存仓储（见各 `*Repository`），无需 MySQL 即可启动；接入真实数据库时移除 `RescueStockApplication` 上的自动装配排除项并补充数据源配置。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + ECharts |
| 后端 | Spring Boot 3 + Java 17 + MyBatis-Plus |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, components/transfer, hooks, services, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

移库功能按层拆分的关键文件：

- 前端：`types/TransferOrder.ts`、`types/TransferStatus.ts`、`constants/TransferStatus.ts`、`constants/errorCodes.ts`、`constants/errorMessages.ts`、`services/transferRules.ts`、`api/TransferOrder.ts`、`stores/TransferOrderStore.ts`、`hooks/useTransferFlow.ts`、`components/transfer/TransferCreateForm.vue`、`components/transfer/TransferInTransitList.vue`、`components/common/TransferStatusBadge.vue`、`pages/WarehousesPage.vue`
- 后端：`constants/TransferStatus.java`、`models/TransferOrder.java`、`models/TransferLine.java`、`types/TransferOrderPayload.java`、`repositories/TransferOrderRepository.java`、`services/TransferOrderService.java`、`controllers/TransferOrderController.java`、`routes/TransferOrderRoutes.java`
- 数据库：`database/init.sql` 中的 `transfer_order`、`transfer_line` 两张表

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `rescue-stock`
- `FRONTEND_PORT`: 前端端口，默认 `20102`
- `BACKEND_PORT`: 后端端口，默认 `21102`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: rescue-stock`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-rescue-stock}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- SupplyCategory: constants/SupplyCategory、types/SupplyCategory、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DispatchStatus: constants/DispatchStatus、types/DispatchStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ShelterStatus: constants/ShelterStatus、types/ShelterStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TransferStatus（IN_TRANSIT 在途 / POSTED 已入账）:
  - 前端：`types/TransferStatus.ts`、`constants/TransferStatus.ts`、`constants/statusText.ts`、`types/TransferOrder.ts`、`constructors/TransferOrderConstructor.ts`、`constants/logTemplates.ts`、`constants/errorCodes.ts`、`constants/errorMessages.ts`、`utils/formatters.ts`、`services/transferRules.ts`、`components/common/TransferStatusBadge.vue`、`stores/TransferOrderStore.ts`、`pages/WarehousesPage.vue`
  - 后端：`constants/TransferStatus.java`、`models/TransferOrder.java`、`services/TransferOrderService.java`、`repositories/TransferOrderRepository.java`、`constants/ErrorCodes.java`、`constants/ErrorMessages.java`、`constants/LogTemplates.java`、`constructors/TransferOrderDtoFactory.java`

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。以移库功能为例，新增一个错误原因就要同时改动错误码、消息模板（前后端各一份）、规则引擎、store 反馈与页面提示。

## License

MIT
