export type DeliveryEvent = {
  id: string; courseCode: string; title: string; type: string; acceptedBySqs: boolean;
  attempts: number; nextAttemptAt: string | null; createdAt: string; expectedRecipients: number | null;
};
export type DeliveryReceipt = { id: string; processed: boolean; delivered: number; readCount: number };

/** A missing consumer response is unknown, never proof that delivery failed or succeeded. */
export function deliveryState(event: DeliveryEvent, receipt?: DeliveryReceipt) {
  if (receipt?.processed) return { key: "processed", label: "Procesado por consumidor" };
  if (event.acceptedBySqs) return { key: "accepted", label: "Aceptado por SQS" };
  return { key: "pending", label: event.attempts > 0 ? "Pendiente de reintento" : "Pendiente de envío" };
}
