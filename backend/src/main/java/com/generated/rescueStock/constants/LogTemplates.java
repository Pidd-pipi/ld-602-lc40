package com.generated.rescueStock.constants;

public final class LogTemplates {
  public static final String CREATE="create";
  public static final String UPDATE="update";
  public static final String STATUS="status";
  public static final String EXPORT="export";
  /** 移库单写操作日志模板 */
  public static final String TRANSFER_CREATE="移库单创建（来源数量冻结）";
  public static final String TRANSFER_RECEIVE="移库单确认收货（转入目标仓库存）";
  public static final String TRANSFER_REJECT="移库单拒绝入账（来源数量已变化）";

  private LogTemplates() {}
}
