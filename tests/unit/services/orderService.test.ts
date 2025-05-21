import { getOrders } from "../../../src/services/orderService";
import * as repository from "../../../src/repositories/orderRepository";

jest.mock("../../../src/repositories/orderRepository");

describe("getOrders - Order Service", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });


    it("should return the orders when receiving valid filters", async () => {
        const filters = {
            orderId: "123",
            startDate: "2021-01-01",
            endDate: "2021-12-31",
        };

        const mockData = [{ order_id: 123 }];
        (repository.findOrdersWithFilters as jest.Mock).mockResolvedValue(mockData);

        const result = await getOrders(filters);
        expect(repository.findOrdersWithFilters).toHaveBeenCalledWith(filters);
        expect(result).toEqual(mockData);
    });

    it("should throw an error if startDate is invalid", async () => {
        await expect(
            getOrders({ startDate: "2021-13-01" })
        ).rejects.toThrow("Invalid start date.");
    });

    it("should throw an error if endDate is invalid but startDate is valid", async () => {
        await expect(
            getOrders({ startDate: "2021-01-01", endDate: "2021-13-01" })
        ).rejects.toThrow("Invalid end date.");
    });

    it("should throw an error if startDate is greater than endDate", async () => {
        await expect(
            getOrders({ startDate: "2022-01-01", endDate: "2021-01-01" })
        ).rejects.toThrow("The start date cannot be greater than the end date.");
    });

    it("should throw an error if orderId is not numeric", async () => {
        await expect(
            getOrders({ orderId: "abc" })
        ).rejects.toThrow("Invalid order ID.");
    });

    it("should work if no filters are provided", async () => {
        (repository.findOrdersWithFilters as jest.Mock).mockResolvedValue([]);

        const result = await getOrders({});
        expect(repository.findOrdersWithFilters).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });
});
