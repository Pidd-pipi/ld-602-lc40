package com.generated.rescueStock.services;

import java.util.Map;

/** 移库业务规则异常：service 抛出，controller 包装为响应，错误消息保持可展示原因。 */
public class TransferServiceException extends RuntimeException {
  private final String code;
  private final Map<String, Object> context;

  public TransferServiceException(String code, String message) {
    this(code, message, Map.of());
  }

  public TransferServiceException(String code, String message, Map<String, Object> context) {
    super(message);
    this.code = code;
    this.context = context;
  }

  public String getCode() { return code; }
  public Map<String, Object> getContext() { return context; }
}
