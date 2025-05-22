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
                {
                    $match: {
                        orders: {
                            $elemMatch: {
                                order_id: 123
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        name: 1,
                        orders: {
                            $filter: {
                                input: "$orders",
                                as: "order",
                                cond: {
                                    $and: [
                                        { $eq: ["$$order.order_id", 123] }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: true }
                    }
                }
            ]);
            expect(result).toEqual(["mocked data"]);
        });

        it("should build the pipeline with start and end dates", async () => {
            mockToArray.mockResolvedValue(["filtered"]);

            await findOrdersWithFilters({ startDate: "2021-01-01", endDate: "2021-12-31" });

            expect(mockAggregate).toHaveBeenCalledWith([
                {
                    $match: {
                        orders: {
                            $elemMatch: {
                                date: {
                                    $gte: "2021-01-01",
                                    $lte: "2021-12-31"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        name: 1,
                        orders: {
                            $filter: {
                                input: "$orders",
                                as: "order",
                                cond: {
                                    $and: [
                                        { $gte: ["$$order.date", "2021-01-01"] },
                                        { $lte: ["$$order.date", "2021-12-31"] }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: true }
                    }
                }
            ]);
        });

        it("should combine orderId and dates in the pipeline", async () => {
            mockToArray.mockResolvedValue(["combined"]);

            await findOrdersWithFilters({ orderId: "5", startDate: "2021-01-01" });

            expect(mockAggregate).toHaveBeenCalledWith([
                {
                    $match: {
                        orders: {
                            $elemMatch: {
                                order_id: 5,
                                date: {
                                    $gte: "2021-01-01"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        name: 1,
                        orders: {
                            $filter: {
                                input: "$orders",
                                as: "order",
                                cond: {
                                    $and: [
                                        { $eq: ["$$order.order_id", 5] },
                                        { $gte: ["$$order.date", "2021-01-01"] }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: true }
                    }
                }
            ]);
        });

        it("should work with no filters (return all orders)", async () => {
            mockToArray.mockResolvedValue(["all"]);

            await findOrdersWithFilters({});

            expect(mockAggregate).toHaveBeenCalledWith([
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        name: 1,
                        orders: {
                            $filter: {
                                input: "$orders",
                                as: "order",
                                cond: {}
                            }
                        }
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: true }
                    }
                }
            ]);
        });
    });
});
