export const TransferStatus = ["IN_TRANSIT", "POSTED"] as const;
export type TransferStatus = (typeof TransferStatus)[number];
export const TransferStatusText: Record<TransferStatus, string> = {
  IN_TRANSIT: "在途",
  POSTED: "已入账"
};
