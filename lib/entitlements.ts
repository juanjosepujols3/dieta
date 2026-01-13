import type { Entitlement } from "@prisma/client";

export function resolveAccessWeeks(entitlement: Entitlement) {
  return entitlement === "PAID" || entitlement === "COMPED" ? 4 : 1;
}
