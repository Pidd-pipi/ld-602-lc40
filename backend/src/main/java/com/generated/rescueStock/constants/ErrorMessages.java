package com.generated.rescueStock.constants;

public final class ErrorMessages {
  public static final String AUTH_REQUIRED = "missing token";
  public static final String RBAC_DENIED = "role denied";
  public static final String VALIDATION_FAILED = "表单字段缺失或格式错误";
  public static final String TRANSFER_WAREHOUSE_SAME = "来源仓与目标仓不能相同";
  public static final String TRANSFER_INSUFFICIENT_STOCK = "来源批次可用库存不足，当前可用 %d，申请冻结 %d";
  public static final String TRANSFER_BATCH_IN_TRANSIT = "该批次已有在途移库单（单号 %s），需先收货或作废后才能再次移出";
  public static final String TRANSFER_ORDER_NOT_FOUND = "移库单不存在或已被删除";
  public static final String TRANSFER_STATUS_CONFLICT = "移库单当前状态为 %s，无法执行该操作";
  public static final String TRANSFER_FROZEN_CHANGED =
      "来源批次冻结数量已经变化（提交时冻结 %d，当前冻结 %d；批次库存 %d → %d），已停止入账，请盘点后重新发起移库";

  private ErrorMessages() {}
}
