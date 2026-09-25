import { TransferStatusText } from "../types/TransferStatus";

export { TransferStatusText };
export const TRANSFER_STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "全部" },
  { value: "IN_TRANSIT", label: TransferStatusText.IN_TRANSIT },
  { value: "POSTED", label: TransferStatusText.POSTED }
];
