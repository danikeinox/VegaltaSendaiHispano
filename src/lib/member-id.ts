import type { Prisma } from "@prisma/client";
import { formatMemberId } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Asigna un ID consecutivo atómico mediante SELECT FOR UPDATE.
 * Evita condiciones de carrera bajo alta concurrencia.
 */
export async function allocateMemberNumber(
  tx: Prisma.TransactionClient
): Promise<number> {
  const rows = await tx.$queryRaw<{ value: number }[]>`
    SELECT value FROM id_sequence WHERE id = 1 FOR UPDATE
  `;

  if (rows.length === 0) {
    await tx.idSequence.create({ data: { id: 1, value: 0 } });
  }

  const updated = await tx.$queryRaw<{ value: number }[]>`
    UPDATE id_sequence
    SET value = value + 1
    WHERE id = 1
    RETURNING value
  `;

  const memberNumber = updated[0]?.value;
  if (!memberNumber || memberNumber < 1) {
    throw new Error("Failed to allocate member number");
  }

  return memberNumber;
}

export async function registerMember(data: {
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
}) {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.member.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        return { member: existing, isNew: false };
      }

      const memberNumber = await allocateMemberNumber(tx);
      const displayId = formatMemberId(memberNumber);

      const member = await tx.member.create({
        data: {
          memberNumber,
          displayId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          country: data.country || null,
        },
      });

      return { member, isNew: true };
    },
    { isolationLevel: "Serializable" }
  );
}
