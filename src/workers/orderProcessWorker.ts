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
    if (!task) return;

    try {
      await parseAndInsert(task.raw);
      await markTaskAsDone(task._id);
      console.log(` task ${task._id.toHexString()} processed successfully.`);
    } catch (err) {
      console.error(`❌ Error processing task ${task._id.toHexString()}:`, err);
      await markTaskAsError(task._id);
    }
  }, INTERVAL);
}
