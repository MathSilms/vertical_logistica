import { enqueueFile } from "../../../src/services/queueService";
import * as queueRepository from "../../../src/repositories/queueRepository";

jest.mock("../../../src/repositories/queueRepository");

describe("enqueueFile", () => {
  const mockInsertQueueTask = jest.spyOn(queueRepository, "insertQueueTask");

  beforeEach(() => {
    mockInsertQueueTask.mockClear();
  });

  it("should enqueue successfully", async () => {
    mockInsertQueueTask.mockResolvedValueOnce(undefined);
    await expect(enqueueFile("Invalid content")).resolves.not.toThrow();
    expect(mockInsertQueueTask).toHaveBeenCalledWith("Invalid content");
  });

  it("should throw an error for empty content", async () => {
    await expect(enqueueFile("")).rejects.toThrow("Invalid content.");
    expect(mockInsertQueueTask).not.toHaveBeenCalled();
  });

  it("should throw an error for invalid type", async () => {
    // @ts-ignore: Testando valor inválido de propósito
    await expect(enqueueFile(123)).rejects.toThrow("Invalid content.");
    expect(mockInsertQueueTask).not.toHaveBeenCalled();
  });
});
