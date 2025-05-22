import { startOrderProcessWorker, INTERVAL } from "../../../src/workers/orderProcessWorker";
import { getNextTask, parseAndInsert, updateTask } from "../../../src/services/transformService";

jest.mock("../../../src/services/transformService", () => ({
    getNextTask: jest.fn(),
    parseAndInsert: jest.fn(),
    updateTask: jest.fn()
}));

const fakeTask = {
    _id: {
        toHexString: () => "mocked_id"
    },
    raw: "fake raw content"
};

describe("startOrderProcessWorker", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        
        (getNextTask as jest.Mock).mockResolvedValue(fakeTask);
        (parseAndInsert as jest.Mock).mockResolvedValue(undefined);
        (updateTask as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should process tasks at defined intervals", async () => {
        startOrderProcessWorker();

        await jest.advanceTimersByTimeAsync(INTERVAL);
        await Promise.resolve();

        expect(getNextTask).toHaveBeenCalled();
        expect(parseAndInsert).toHaveBeenCalledWith("fake raw content");
        expect(updateTask).toHaveBeenCalledWith(fakeTask._id, "done");
    });

    it("should mark task as error if processing fails", async () => {
        (parseAndInsert as jest.Mock).mockRejectedValueOnce(new Error("Erro ao processar"));

        startOrderProcessWorker();
        await jest.advanceTimersByTimeAsync(INTERVAL);
        await Promise.resolve();

        expect(updateTask).toHaveBeenCalledWith(fakeTask._id, "error");
    });

    it("should do nothing if there is no pending task", async () => {
        (getNextTask as jest.Mock).mockResolvedValue(null);

        startOrderProcessWorker();
        await jest.advanceTimersByTimeAsync(INTERVAL);
        await Promise.resolve();

        expect(parseAndInsert).not.toHaveBeenCalled();
        expect(updateTask).not.toHaveBeenCalled();
    });
});
