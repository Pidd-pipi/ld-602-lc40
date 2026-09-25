package com.generated.rescueStock.middlewares;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局兜底异常处理。
 * 移库业务异常 TransferServiceException 已在 controller 单独包装并附带原因，
 * 这里只兜底未预期异常，避免向前端吐出堆栈。
 */
@RestControllerAdvice
public class ErrorHandlerMiddleware {

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleUnexpected(Exception error) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("code", "INTERNAL_ERROR", "message", "服务内部错误，请稍后重试"));
  }
}
