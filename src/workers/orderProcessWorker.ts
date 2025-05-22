import { getNextTask, parseAndInsert, updateTask } from "../services/transformService";

export const INTERVAL = 120000;

export async function processNextTask() {
  const task = await getNextTask();
  if (!task) return;

  try {
    await parseAndInsert(task.raw);
    await updateTask(task._id, 'done');
    console.log(` task ${task._id.toHexString()} processed successfully.`);
  } catch (err) {
    console.error(`❌ Error processing task ${task._id.toHexString()}:`, err);
    await updateTask(task._id, 'error');
  }
}

export function startOrderProcessWorker() {
  setInterval(processNextTask, INTERVAL);
}
