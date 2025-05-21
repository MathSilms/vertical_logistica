import {
    startOrderProcessWorker,
    INTERVAL
} from "../../../src/workers/orderProcessWorker";

jest.mock("../../../src/services/transformService", () => ({
    parseAndInsert: jest.fn()
}));

jest.mock("../../../src/repositories/queueRepository", () => ({
    getNextPendingTask: jest.fn(),
    markTaskAsDone: jest.fn(),
    markTaskAsError: jest.fn()
}));

import { parseAndInsert } from "../../../src/services/transformService";
import {
    getNextPendingTask,
    markTaskAsDone,
    markTaskAsError
} from "../../../src/repositories/queueRepository";

const fakeTask = {
    _id: { toHexString: () => "mocked_id" },
    raw: "fake raw content"
};

describe("startOrderProcessWorker", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        (getNextPendingTask as jest.Mock).mockResolvedValue(fakeTask);
        (parseAndInsert as jest.Mock).mockResolvedValue(undefined);
        (markTaskAsDone as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should process tasks at defined intervals", async () => {
        startOrderProcessWorker();

        await jest.advanceTimersByTimeAsync(INTERVAL);

        await Promise.resolve();

        expect(getNextPendingTask).toHaveBeenCalled();
        expect(parseAndInsert).toHaveBeenCalledWith("fake raw content");
        expect(markTaskAsDone).toHaveBeenCalledWith(fakeTask._id);
    });

    it("should call markTaskAsError if parsing fails", async () => {
        (parseAndInsert as jest.Mock).mockRejectedValueOnce(new Error("Erro ao processar"));

        startOrderProcessWorker();
        await jest.advanceTimersByTimeAsync(INTERVAL);
        await Promise.resolve();

        expect(markTaskAsError).toHaveBeenCalledWith(fakeTask._id);
    });

    it("should do nothing if there is no pending task", async () => {
        (getNextPendingTask as jest.Mock).mockResolvedValue(null);

        startOrderProcessWorker();
        await jest.advanceTimersByTimeAsync(INTERVAL);
        await Promise.resolve();

        expect(parseAndInsert).not.toHaveBeenCalled();
        expect(markTaskAsDone).not.toHaveBeenCalled();
    });
});
