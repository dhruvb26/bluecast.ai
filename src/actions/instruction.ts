"use server";

import { db } from "@/server/db";
import { instructions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getUser } from "@/actions/user";

export async function createInstruction(name: string, instructionText: string) {
  const user = await getUser();
  const id = uuid();
  await db.insert(instructions).values({
    id,
    userId: user.id,
    name,
    instructions: instructionText,
  });
  return id;
}

export async function getInstruction(id: string) {
  const [instruction] = await db
    .select()
    .from(instructions)
    .where(eq(instructions.id, id));
  return instruction;
}

export async function updateInstruction(
  id: string,
  name: string,
  instructionText: string
) {
  await db
    .update(instructions)
    .set({ name, instructions: instructionText })
    .where(eq(instructions.id, id));
}

export async function deleteInstruction(id: string) {
  await db.delete(instructions).where(eq(instructions.id, id));
}

export async function listInstructions() {
  const user = await getUser();
  return db.select().from(instructions).where(eq(instructions.userId, user.id));
}
