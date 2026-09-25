# 城市防灾应急物资调度系统

面向街道、社区和应急仓库的防灾物资储备与调拨平台，覆盖物资库存、避难点、事件响应和调拨审批。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20102>

后端健康检查：<http://localhost:21102/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + ECharts |
| 后端 | Spring Boot 3 + Java 17 + MyBatis-Plus |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

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
- TransferStatus（移库单状态 IN_TRANSIT 在途 / POSTED 已入账）: constants/TransferStatus、types/TransferStatus、types/TransferOrder、constructors/TransferOrderConstructor、logTemplates.TransferOrder、errorCodes/errorMessages（TRANSFER_*）、hooks/useTransferFlow、stores/TransferOrderStore、仓库页状态徽标与筛选项、后端 constants/TransferStatus 均有引用。

## 移库单（仓库间借调）业务规则

- 仓库员在「仓库库存」页选择来源仓、目标仓、来源批次与数量后提交移库单。
- **提交即冻结**：来源批次实际库存不立即扣减，只把数量记为在途冻结；可用库存 = 实际库存 − 在途冻结。
- 提交校验（失败时提示具体原因）：来源仓与目标仓不能相同；同一来源批次已有在途移库单时拒绝；可用库存不足时拒绝。
- **目标仓确认收货**时才把冻结数量转入目标仓库存（同物资同批次合并，否则生成新批次），同时扣减来源批次实际库存。
- 收货时重新比对提交时记录的「来源批次实际库存 / 在途冻结总量」快照，任一已变化（如期间发生盘点报损）即**停止入账**并提示，单据保留在途状态。
- 仓库页可查看每个仓库、每个批次的移出数量、在途数量与已入账数量。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
