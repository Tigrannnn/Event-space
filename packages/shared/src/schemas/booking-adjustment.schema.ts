import z from "zod";
import { AdjustmentStatusSchema, AdjustmentTypeSchema } from "../generated";

export { AdjustmentStatusSchema };
export type AdjustmentStatus = z.infer<typeof AdjustmentStatusSchema>;
export { AdjustmentTypeSchema };
export type AdjustmentType = z.infer<typeof AdjustmentTypeSchema>;
export { BookingAdjustmentSchema } from "../generated";
export type { BookingAdjustment } from "../generated";