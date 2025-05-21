import request from "supertest";
import express from "express";
import multer from "multer";
import * as orderService from "../../../src/services/orderService";
import * as queueService from "../../../src/services/queueService";
import { handleUpload, handleGetOrders } from "../../../src/controllers/ordersController";

jest.mock("../../../src/services/orderService");
jest.mock("../../../src/services/queueService");

const app = express();
const upload = multer();

app.post("/upload", upload.single("file"), handleUpload);
app.get("/orders", handleGetOrders);

describe("Orders Controller", () => {

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    describe("handleUpload", () => {
        it("should return an error if no file is provided", async () => {
            const res = await request(app).post("/upload");
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "No file provided." });
        });

        it("should return an error if the file is empty", async () => {
            const res = await request(app)
                .post("/upload")
                .attach("file", Buffer.from(" "), "empty.txt");

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "File is empty." });
        });

        it("should enqueue the file successfully", async () => {
            (queueService.enqueueFile as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app)
                .post("/upload")
                .attach("file", Buffer.from("test line"), "dados.txt");

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: "File successfully enqueued." });
        });

        it("should return an internal error when enqueuing", async () => {
            (queueService.enqueueFile as jest.Mock).mockRejectedValue(new Error("Internal Error"));

            const res = await request(app)
                .post("/upload")
                .attach("file", Buffer.from("content"), "data.txt");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: "Error enqueuing the file." });
        });
    });

    describe("handleGetOrders", () => {
        it("should return the filtered orders", async () => {
            const mockOrders = [{ user_id: 1, name: "Fulano", orders: [] }];
            (orderService.getOrders as jest.Mock).mockResolvedValue(mockOrders);

            const res = await request(app).get("/orders").query({ orderId: "10" });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockOrders);
        });

        it("should return an internal error with a string message if the error is not an instance of Error", async () => {
            (orderService.getOrders as jest.Mock).mockRejectedValue("String Error");

            const res = await request(app).get("/orders");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: "Error fetching orders",
                message: "String Error",
            });
        });

        it("should return an internal error when fetching orders", async () => {
            (orderService.getOrders as jest.Mock).mockRejectedValue(new Error("Erro DB"));

            const res = await request(app).get("/orders").query({});

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error fetching orders', message: 'Erro DB' });
        });
    });
});
