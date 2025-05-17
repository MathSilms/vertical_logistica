import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 1 });

export function enqueueFileProcess(rawFileContent: string): Promise<void> {
  return queue.add(async () => {
    console.log("📥 Processando novo arquivo...");
    console.log("✅ Arquivo finalizado.");
  });
}
