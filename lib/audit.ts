type AuditEvent = {
  action: string;
  status: "success" | "warning" | "error";
  payload?: Record<string, unknown>;
};

export function auditAction(event: AuditEvent) {
  const payload = {
    timestamp: new Date().toISOString(),
    action: event.action,
    status: event.status,
    ...event.payload,
  };

  if (process.env.NODE_ENV === "production") {
    console.info("[AUDIT]", JSON.stringify(payload));
    return;
  }

  console.info("[AUDIT]", payload);
}
