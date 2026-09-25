export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TRANSFER_WAREHOUSE_SAME: "来源仓与目标仓不能相同",
  TRANSFER_INSUFFICIENT_STOCK: "来源批次可用库存不足，当前可用 {available}，申请冻结 {quantity}",
  TRANSFER_BATCH_IN_TRANSIT: "该批次已有在途移库单（单号 {transferNo}），需先收货或作废后才能再次移出",
  TRANSFER_ORDER_NOT_FOUND: "移库单不存在或已被删除",
  TRANSFER_STATUS_CONFLICT: "移库单当前状态为 {status}，无法执行该操作",
  TRANSFER_FROZEN_CHANGED: "来源批次冻结数量已变化（提交时冻结 {frozenSnapshot}，当前冻结 {frozenNow}；批次库存 {quantitySnapshot} → {quantityNow}），为避免批次数量对不上，已停止入账，请盘点后重新发起移库"
};
