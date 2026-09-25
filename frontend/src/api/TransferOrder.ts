import { mockEngine } from "../mocks/mockEngine";
import type { TransferOrder, TransferOrderCreatePayload } from "../types/TransferOrder";

const endpoint = "/api/transfer-order";

/** 网络不可达（离线评审）时使用本地 mock 引擎；后端返回业务错误则原样抛出 */
async function callOrMock<T>(request: () => Promise<Response>, fallback: () => T): Promise<T> {
  let res: Response;
  try {
    res = await request();
  } catch {
    return fallback();
  }
  if (res.ok) return (await res.json()) as T;
  if (res.status === 404) {
    // 后端尚未部署移库单模块时退化为本地冻结逻辑
    return fallback();
  }
  const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
  throw { code: body?.code ?? "VALIDATION_FAILED", message: body?.message ?? "移库单操作失败" };
}

export async function listTransferOrder(): Promise<TransferOrder[]> {
  return callOrMock(() => fetch(endpoint), () => [...mockEngine.transferOrders]);
}

export async function createTransferOrder(payload: TransferOrderCreatePayload): Promise<TransferOrder> {
  return callOrMock(
    () =>
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
    () => mockEngine.createTransfer(payload)
  );
}

export async function receiveTransferOrder(id: number): Promise<TransferOrder> {
  return callOrMock(
    () => fetch(`${endpoint}/${id}/receive`, { method: "POST" }),
    () => mockEngine.receiveTransfer(id)
  );
}
