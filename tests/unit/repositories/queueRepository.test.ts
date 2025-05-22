import { ObjectId } from "mongodb";
import * as mongoClient from "../../../src/configs/mongoClient";
import * as queueRepository from "../../../src/repositories/queueRepository";

describe("queueRepository", () => {
    const mockCollection = {
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn(),
        insertOne: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(mongoClient, "getCollection").mockReturnValue(mockCollection as any);
    });

    describe("getNextPendingTask", () => {
        it("should fetch and update the oldest pending task", async () => {
            const fakeTask = { _id: new ObjectId(), raw: "data", status: "processing" };
            mockCollection.findOneAndUpdate.mockResolvedValueOnce(fakeTask);

            const result = await queueRepository.getNextPendingTask();

            expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
                { status: "pending" },
                expect.objectContaining({ $set: expect.any(Object) }),
                { sort: { createdAt: 1 }, returnDocument: "after" }
            );
            expect(result).toEqual(fakeTask);
        });

        it("should return null if no task is found", async () => {
            mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);

            const result = await queueRepository.getNextPendingTask();

            expect(result).toBeNull();
        });
    });

    describe("markTaskAsDone", () => {
        it("should update the task status to 'done'", async () => {
            const id = new ObjectId();
            await queueRepository.markTaskAsDone(id);

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { _id: id },
                expect.objectContaining({ $set: expect.objectContaining({ status: "done" }) })
            );
        });
    });

    describe("markTaskAsError", () => {
        it("should update the task status to 'error'", async () => {
            const id = new ObjectId();
            await queueRepository.markTaskAsError(id);

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { _id: id },
                expect.objectContaining({ $set: expect.objectContaining({ status: "error" }) })
            );
        });
    });

    describe("insertQueueTask", () => {
        it("should throw an error if the content is invalid", async () => {
            await expect(queueRepository.insertQueueTask(null as any)).rejects.toThrow("Conteúdo inválido.");
            await expect(queueRepository.insertQueueTask(123 as any)).rejects.toThrow("Conteúdo inválido.");
        });

        it("should insert a valid new task with status 'pending'", async () => {
            const raw = "linha1\nlinha2";
            await queueRepository.insertQueueTask(raw);

            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    raw,
                    status: "pending",
                    createdAt: expect.any(Date),
                    updatedAt: null,
                })
            );
        });
    });
});