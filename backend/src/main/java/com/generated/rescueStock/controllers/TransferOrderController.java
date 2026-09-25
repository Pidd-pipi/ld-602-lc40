package com.generated.rescueStock.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.generated.rescueStock.services.TransferBusinessException;
import com.generated.rescueStock.services.TransferOrderService;
import com.generated.rescueStock.types.TransferOrderPayload;

@RestController
@RequestMapping("/api/transfer-order")
public class TransferOrderController {
  private final TransferOrderService service;

  public TransferOrderController(TransferOrderService service) { this.service = service; }

  @GetMapping
  public List<Map<String, Object>> list() {
    return service.list();
  }

  /** 仓库员提交移库单：来源数量先冻结 */
  @PostMapping
  public ResponseEntity<Map<String, Object>> create(@RequestBody TransferOrderPayload payload) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(payload));
  }

  /** 目标仓确认收货：冻结数量转入库存 */
  @PostMapping("/{id}/receive")
  public Map<String, Object> receive(@PathVariable Long id) {
    return service.receive(id);
  }

  /** controller 层包装：业务异常转换为 409 + 错误码，service 与 controller 分别承担校验/协议职责 */
  @ExceptionHandler(TransferBusinessException.class)
  public ResponseEntity<Map<String, String>> handleBusiness(TransferBusinessException error) {
    HttpStatus status = switch (error.getCode()) {
      case "TRANSFER_ORDER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
      case "TRANSFER_STATUS_CONFLICT", "TRANSFER_FROZEN_CHANGED" -> HttpStatus.CONFLICT;
      default -> HttpStatus.BAD_REQUEST;
    };
    return ResponseEntity.status(status).body(Map.of("code", error.getCode(), "message", error.getMessage()));
  }
}
