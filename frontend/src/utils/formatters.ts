export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
/** 错误消息模板填充：{name} 占位符按 params 替换 */
export const formatMessage = (template: string, params: Record<string, string | number> = {}) =>
  Object.entries(params).reduce((msg, [key, val]) => msg.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)), template);
export const formatQuantity = (value: number) => (Number.isFinite(value) ? new Intl.NumberFormat("zh-CN").format(value) : "0");
