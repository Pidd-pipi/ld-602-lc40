package com.generated.rescueStock.constants;

public final class LogTemplates {
  public static final String CREATE = "create";
  public static final String UPDATE = "update";
  public static final String STATUS = "status";
  public static final String EXPORT = "export";

  /** 移库单操作日志模板 */
  public static final String TRANSFER_CREATE = "移库单创建并冻结来源库存 %s 批次 %s 数量 %d";
  public static final String TRANSFER_RECEIVE = "移库单确认收货入账 %s 批次 %s 数量 %d 转入仓库 %d";
  public static final String TRANSFER_RECEIVE_BLOCKED = "移库单收货校验失败拦截 %s 冻结 %d→%d 库存 %d→%d";
  public static final String TRANSFER_EXPORT = "移库单导出";
  public static final String INVENTORY_BATCH_ADJUST = "库存批次盘点调整 批次 %s 调整后数量 %d";

  private LogTemplates() {}
}
