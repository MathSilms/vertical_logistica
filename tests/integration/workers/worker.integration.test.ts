import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { processNextTask } from "../../../src/workers/orderProcessWorker";
import { getCollection } from "../../../src/configs/mongoClient";
import * as mongoClient from "../../../src/configs/mongoClient";

let mongod: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = new MongoClient(uri);
  await client.connect();

  jest.spyOn(mongoClient, "getCollection").mockImplementation((name: string) => {
    return client.db("test").collection(name);
  });
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  await getCollection("orders").deleteMany({});
  await getCollection("queue_tasks").deleteMany({});

  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

it("should process a task and save orders correctly", async () => {
  const raw = `
        0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308
        0000000075                                  Bobbie Batz00000007980000000002     1578.5720211116
        0000000049                               Ken Wintheiser00000005230000000003      586.7420210903
        0000000057                          Elidia Gulgowski IV00000006200000000000     1417.2520210919
`.trim();

  const task = {
    _id: new ObjectId(),
    raw,
    status: "pending",
    createdAt: new Date(),
    updatedAt: null,
  };

  await getCollection("queue_tasks").insertOne(task);

  await processNextTask();

  const updatedTask = await getCollection("queue_tasks").findOne({ _id: task._id });
  expect(updatedTask?.status).toBe("done");

  const users = await getCollection("orders").find({}).toArray();
  expect(users.length).toBe(4);

  const palmer = users.find(u => u.user_id === 70);
  expect(palmer?.name).toBe("Palmer Prosacco");
  expect(palmer?.orders[0].total).toBeCloseTo(1836.74, 2);
  expect(palmer?.orders[0].products.length).toBe(1);

  const bobbie = users.find(u => u.user_id === 75);
  expect(bobbie?.name).toBe("Bobbie Batz");
  expect(bobbie?.orders[0].total).toBeCloseTo(1578.57, 2);

  const ken = users.find(u => u.user_id === 49);
  expect(ken?.name).toBe("Ken Wintheiser");
  expect(ken?.orders[0].total).toBeCloseTo(586.74, 2);

  const elidia = users.find(u => u.user_id === 57);
  expect(elidia?.name).toBe("Elidia Gulgowski IV");
  expect(elidia?.orders[0].total).toBeCloseTo(1417.25, 2);
});
