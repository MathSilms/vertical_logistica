import { insertOrders, findOrdersWithFilters } from "../../../src/repositories/orderRepository";
import { getCollection } from "../../../src/configs/mongoClient";

jest.mock("../../../src/configs/mongoClient");

const mockDeleteMany = jest.fn();
const mockInsertMany = jest.fn();
const mockAggregate = jest.fn();
const mockToArray = jest.fn();

const mockCollection = {
    deleteMany: mockDeleteMany,
    insertMany: mockInsertMany,
    aggregate: mockAggregate,
};

describe("orderRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getCollection as jest.Mock).mockReturnValue(mockCollection);
        mockAggregate.mockReturnValue({ toArray: mockToArray });
    });

    describe("insertOrders", () => {
        it("should clear and insert the orders", async () => {
            const mockDocs = [{ user_id: 1, orders: [] }];

            await insertOrders(mockDocs);

            expect(getCollection).toHaveBeenCalledWith("orders");
            expect(mockDeleteMany).toHaveBeenCalledWith({});
            expect(mockInsertMany).toHaveBeenCalledWith(mockDocs);
        });
    });

    describe("findOrdersWithFilters", () => {
        it("should build the pipeline with orderId", async () => {
            mockToArray.mockResolvedValue(["mocked data"]);

            const result = await findOrdersWithFilters({ orderId: "123" });

            expect(mockAggregate).toHaveBeenCalledWith([
                { $match: { "orders.order_id": 123 } }
            ]);
            expect(result).toEqual(["mocked data"]);
        });

        it("should build the pipeline with start and end dates", async () => {
            mockToArray.mockResolvedValue(["filtered"]);

            await findOrdersWithFilters({ startDate: "2021-01-01", endDate: "2021-12-31" });

            expect(mockAggregate).toHaveBeenCalledWith([
                {
                    $match: {
                        "orders.date": {
                            $gte: "2021-01-01",
                            $lte: "2021-12-31"
                        }
                    }
                }
            ]);
        });

        it("should combine orderId and dates in the pipeline", async () => {
            mockToArray.mockResolvedValue(["combined"]);

            await findOrdersWithFilters({ orderId: "5", startDate: "2021-01-01" });

            expect(mockAggregate).toHaveBeenCalledWith([
                { $match: { "orders.order_id": 5 } },
                { $match: { "orders.date": { $gte: "2021-01-01" } } }
            ]);
        });
    });
});
