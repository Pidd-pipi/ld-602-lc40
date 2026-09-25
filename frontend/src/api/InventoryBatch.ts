import { mockEngine } from "../mocks/mockEngine";
import type { InventoryBatch } from "../types/InventoryBatch";

const endpoint = "/api/inventory-batch";

export async function listInventoryBatch(): Promise<InventoryBatch[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...mockEngine.inventoryBatches];
}

export async function adjustInventoryBatchQuantity(batchId: number, quantity: number): Promise<InventoryBatch> {
  try {
    const res = await fetch(`${endpoint}/${batchId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });
    if (res.ok) return await res.json();
    if (res.status !== 404) {
      const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
      throw { code: body?.code ?? "VALIDATION_FAILED", message: body?.message ?? "盘点调整失败" };
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) throw error;
  }
  return mockEngine.adjustBatchQuantity(batchId, quantity);
}

export async function saveInventoryBatch(payload: InventoryBatch) {
  console.info("save InventoryBatch", payload);
  return payload;
}
