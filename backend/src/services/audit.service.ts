import { prisma } from "../config/prisma";

export async function auditLog(
  userId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: { userId: userId ?? undefined, action, entity, entityId, metadata },
  });
}
