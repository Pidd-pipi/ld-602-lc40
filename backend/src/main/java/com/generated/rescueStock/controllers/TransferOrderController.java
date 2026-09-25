package com.generated.rescueStock.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.generated.rescueStock.services.TransferOrderService;
import com.generated.rescueStock.services.TransferServiceException;
import com.generated.rescueStock.types.TransferOrderPayload;

/**
 * 移库单接口（controller 层单独包装业务异常，不依赖全局异常吞掉原因）。
 *  POST /api/transfer-order            提交移库单并冻结来源数量
 *  GET  /api/transfer-order            查询移库单（在途/已入账）
 *  POST /api/transfer-order/{id}/receive  目标仓确认收货，来源数量变化时拒绝入账
 */
@RestController
@RequestMapping("/api/transfer-order")
public class TransferOrderController {
  private final TransferOrderService service;

  public TransferOrderController(TransferOrderService service) {
    this.service = service;
  }

  @GetMapping
  public List<?> list() {
    return service.list();
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody TransferOrderPayload payload) {
    try {
      return ResponseEntity.status(HttpStatus.CREATED).body(service.create(payload));
    } catch (TransferServiceException error) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("code", error.getCode(), "message", error.getMessage(),
              "context", error.getContext()));
    }
  }

  @PostMapping("/{id}/receive")
  public ResponseEntity<?> receive(@PathVariable Long id) {
    try {
      return ResponseEntity.ok(service.receive(id));
    } catch (TransferServiceException error) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("code", error.getCode(), "message", error.getMessage(),
              "context", error.getContext()));
    }
  }
}
