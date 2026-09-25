package com.generated.rescueStock.services;

/** 移库业务异常：携带错误码与可直接展示给仓库员的中文原因 */
public class TransferBusinessException extends RuntimeException {
  private final String code;

  public TransferBusinessException(String code, String message) {
    super(message);
    this.code = code;
  }

  public String getCode() {
    return code;
  }
}
