import * as ordersRepository from "../../../src/repositories/orderRepository";
import * as queueRepository from "../../../src/repositories/queueRepository";
import { parseAndInsert, updateTask } from '../../../src/services/transformService'

jest.mock('../../../src/repositories/orderRepository', () => ({
  insertOrders: jest.fn()
}));

jest.mock("../../../src/repositories/queueRepository", () => ({
  markTaskAsDone: jest.fn(),
  markTaskAsError: jest.fn()
}));

describe('parseAndInsert', () => {
  const validContent = [
    "0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308",
    "0000000075                                  Bobbie Batz00000007980000000002     1578.5720211116",
    "0000000049                               Ken Wintheiser00000005230000000003      586.7420210903",
    "0000000057                          Elidia Gulgowski IV00000006200000000000     1417.2520210919"
  ].join("\n");

  const expectedData = [
    {
      user_id: 49,
      name: "Ken Wintheiser",
      orders: [
        {
          order_id: 523,
          date: "2021-09-03",
          total: 586.74,
          products: [
            { product_id: 3, value: 586.74 }
          ]
        }
      ]
    },
    {
      user_id: 57,
      name: "Elidia Gulgowski IV",
      orders: [
        {
          order_id: 620,
          date: "2021-09-19",
          total: 1417.25,
          products: [
            { product_id: 0, value: 1417.25 }
          ]
        }
      ]
    },
    {
      user_id: 70,
      name: "Palmer Prosacco",
      orders: [
        {
          order_id: 753,
          date: "2021-03-08",
          total: 1836.74,
          products: [
            { product_id: 3, value: 1836.74 }
          ]
        }
      ]
    },
    {
      user_id: 75,
      name: "Bobbie Batz",
      orders: [
        {
          order_id: 798,
          date: "2021-11-16",
          total: 1578.57,
          products: [
            { product_id: 2, value: 1578.57 }
          ]
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ordersRepository.insertOrders as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Success', () => {
    it('should correctly insert multiple well-formatted rows', async () => {
      await expect(parseAndInsert(validContent)).resolves.not.toThrow();
      expect(ordersRepository.insertOrders).toHaveBeenCalledTimes(1);
    });

    it('should call insertOrders with the expected data', async () => {
      await parseAndInsert(validContent);
      expect(ordersRepository.insertOrders).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('Error', () => {
    it('should throw an error if the content contains a malformed line', async () => {
      const badLine = "0000000001 NomeIncompleto 0000000010";
      const contentWithBadLine = validContent.split("\n")[0] + "\n" + badLine;
      await expect(parseAndInsert(contentWithBadLine)).rejects.toThrow("Failed to parse Error: invalid Row");
      expect(ordersRepository.insertOrders).not.toHaveBeenCalled();
    });

    it('should throw an error if any line contains invalid numeric values', async () => {
      const invalidNumericLine = "A000000001                                     User One00000000100000000100000000050.0020210101";
      await expect(parseAndInsert(invalidNumericLine)).rejects.toThrow("Failed to parse Error: invalid Row");
      expect(ordersRepository.insertOrders).not.toHaveBeenCalled();
    });

    it('should catch and rethrow errors with the appropriate message', async () => {
      (ordersRepository.insertOrders as jest.Mock).mockRejectedValueOnce(new Error("invalid Row"));
      await expect(parseAndInsert('')).rejects.toThrow("Failed to parse Error: invalid Row");
      expect(ordersRepository.insertOrders).not.toHaveBeenCalled();
    });
  });
});

describe("updateTask", () => {
  const mockId = { toHexString: () => "abc123" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call markTaskAsDone if status is 'done'", async () => {
    await updateTask(mockId, "done");
    expect(queueRepository.markTaskAsDone).toHaveBeenCalledWith(mockId);
    expect(queueRepository.markTaskAsError).not.toHaveBeenCalled();
  });

  it("should call markTaskAsError if status is 'error'", async () => {
    await updateTask(mockId, "error");
    expect(queueRepository.markTaskAsError as jest.Mock).toHaveBeenCalledWith(mockId);
    expect(queueRepository.markTaskAsDone as jest.Mock).not.toHaveBeenCalled();
  });

  it("should do nothing if status is not 'done' or 'error'", async () => {
    await updateTask(mockId, "unknown");
    expect(queueRepository.markTaskAsDone).not.toHaveBeenCalled();
    expect(queueRepository.markTaskAsError).not.toHaveBeenCalled();
  });
});
