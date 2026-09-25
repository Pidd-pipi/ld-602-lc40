package com.generated.rescueStock.constants;

import java.util.Map;

public final class ErrorMessages {
  public static final String AUTH_REQUIRED="missing token";
  public static final String RBAC_DENIED="role denied";
  public static final String TRANSFER_INSUFFICIENT_STOCK=
      "来源仓库存不足：批次 {batchNo} 可用数量不足（可用 {available}，需冻结 {quantity}）";
  public static final String TRANSFER_BATCH_ALREADY_IN_TRANSIT=
      "同一批次已有在途移库：批次 {batchNo} 已被移库单 {transferNo} 占用，无法重复发起";
  public static final String TRANSFER_FROZEN_CHANGED=
      "来源冻结数量已经变化：批次 {batchNo} 提交时冻结 {frozenSnapshot}，当前冻结 {frozenCurrent}，已停止入账";
  public static final String TRANSFER_SOURCE_QUANTITY_CHANGED=
      "来源冻结数量已经变化：批次 {batchNo} 提交时账面 {quantitySnapshot}，当前账面 {quantityCurrent}，已停止入账";
  public static final String TRANSFER_SAME_WAREHOUSE="来源仓与目标仓不能相同";
  public static final String TRANSFER_LINES_EMPTY="请至少填写一条批次移库明细";
  public static final String TRANSFER_QUANTITY_INVALID="批次 {batchNo} 的移库数量必须为正整数";
  public static final String TRANSFER_ORDER_NOT_FOUND="移库单不存在或已被处理：{transferNo}";
  public static final String TRANSFER_ORDER_NOT_IN_TRANSIT="移库单 {transferNo} 当前不是在途状态，无法确认收货";

  /** 用上下文填充 {placeholder}，对应前端 renderErrorMessage。 */
  public static String render(String template, Map<String, Object> context) {
    if (context == null) return template;
    String result = template;
    for (Map.Entry<String, Object> entry : context.entrySet()) {
      result = result.replace("{" + entry.getKey() + "}", String.valueOf(entry.getValue()));
    }
    return result;
  }

  private ErrorMessages() {}
}
