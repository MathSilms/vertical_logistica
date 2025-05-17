import PQueue from "p-queue";
import { parseAndInsert } from "../services/transformService";

const queue = new PQueue({ concurrency: 1 });

export function enqueueFileProcess(rawFileContent: string): Promise<void> {
  return queue.add(async () => {
    console.log("📥 Processando novo arquivo...");
    await parseAndInsert(rawFileContent);
    console.log("✅ Arquivo finalizado.");
  });
}
