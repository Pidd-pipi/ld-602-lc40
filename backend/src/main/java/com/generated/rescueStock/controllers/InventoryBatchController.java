package com.generated.rescueStock.controllers;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.generated.rescueStock.services.InventoryBatchService;
import com.generated.rescueStock.services.TransferBusinessException;

@RestController
@RequestMapping("/api/inventory-batch")
public class InventoryBatchController {
  private final InventoryBatchService service;

  public InventoryBatchController(InventoryBatchService service) { this.service = service; }

  @GetMapping
  public List<Map<String, Object>> list() { return service.list(); }

  @PostMapping("/{batchId}/adjust")
  public Map<String, Object> adjust(@PathVariable Long batchId, @RequestBody Map<String, Object> body) {
    Object raw = body == null ? null : body.get("quantity");
    Integer quantity = raw instanceof Number n ? n.intValue() : null;
    return service.adjustQuantity(batchId, quantity);
  }

  /** controller 层包装盘点/冻结类业务异常 */
  @ExceptionHandler(TransferBusinessException.class)
  public ResponseEntity<Map<String, String>> handleBusiness(TransferBusinessException error) {
    HttpStatus status = "TRANSFER_ORDER_NOT_FOUND".equals(error.getCode())
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
    return ResponseEntity.status(status).body(Map.of("code", error.getCode(), "message", error.getMessage()));
  }
}
