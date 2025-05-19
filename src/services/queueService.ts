import { insertQueueTask } from "../repositories/queueRepository";

export async function enqueueFile(raw: string) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Conteúdo inválido.");
  }

  await insertQueueTask(raw);
}
