export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TRANSFER_INSUFFICIENT_STOCK: "来源仓库存不足：批次 {batchNo} 可用数量不足（可用 {available}，需冻结 {quantity}）",
  TRANSFER_BATCH_ALREADY_IN_TRANSIT: "同一批次已有在途移库：批次 {batchNo} 已被移库单 {transferNo} 占用，无法重复发起",
  TRANSFER_FROZEN_CHANGED: "来源冻结数量已经变化：批次 {batchNo} 提交时冻结 {frozenSnapshot}，当前冻结 {frozenCurrent}，已停止入账",
  TRANSFER_SOURCE_QUANTITY_CHANGED: "来源冻结数量已经变化：批次 {batchNo} 提交时账面 {quantitySnapshot}，当前账面 {quantityCurrent}，已停止入账",
  TRANSFER_SAME_WAREHOUSE: "来源仓与目标仓不能相同",
  TRANSFER_LINES_EMPTY: "请至少填写一条批次移库明细",
  TRANSFER_QUANTITY_INVALID: "批次 {batchNo} 的移库数量必须为正整数",
  TRANSFER_ORDER_NOT_FOUND: "移库单不存在或已被处理：{transferNo}",
  TRANSFER_ORDER_NOT_IN_TRANSIT: "移库单 {transferNo} 当前不是在途状态，无法确认收货"
};

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/** 用上下文填充错误消息模板中的 {placeholder}。 */
export function renderErrorMessage(template: string, context: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in context ? String(context[key]) : `{${key}}`
  );
}
