import { parseAndInsert } from "../services/transformService";
import {
  getNextPendingTask,
  markTaskAsDone,
  markTaskAsError,
} from "../repositories/queueRepository";

// const INTERVAL = 10000;
const INTERVAL = 120000; // 2 minutos

export function startOrderProcessWorker() {
  setInterval(async () => {

    const task = await getNextPendingTask();
    if (!task) {
      return;
    } else {
    }

    try {
      await parseAndInsert(task.raw);
      await markTaskAsDone(task._id);
      console.log(`✅ Tarefa ${task._id.toHexString()} processada com sucesso.`);
    } catch (err) {
      console.error(`❌ Erro ao processar tarefa ${task._id.toHexString()}:`, err);
      await markTaskAsError(task._id);
    }
  }, INTERVAL);
}
