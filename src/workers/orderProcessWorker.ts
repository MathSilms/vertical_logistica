import { parseAndInsert } from "../services/transformService";
import {
  getNextPendingTask,
  markTaskAsDone,
  markTaskAsError,
} from "../repositories/queueRepository";

export const INTERVAL = 120000;

export async function processNextTask() {
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
}

export function startOrderProcessWorker() {
  setInterval(processNextTask, INTERVAL);
}
