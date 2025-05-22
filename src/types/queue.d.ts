import { Document } from "mongodb";

export interface QueueTask extends Document {
    raw: string;
    status: "pending" | "processing" | "done" | "error";
    createdAt: Date;
    updatedAt: Date | null;
}
