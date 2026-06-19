import z from "zod";
import { AdjustmentStatusSchema, AdjustmentTypeSchema } from "../generated";

export { AdjustmentStatusSchema };
export type AdjustmentStatus = z.infer<typeof AdjustmentStatusSchema>;
export { AdjustmentTypeSchema };
export type AdjustmentType = z.infer<typeof AdjustmentTypeSchema>;
import { BookingAdjustmentSchema as GeneratedBookingAdjustmentSchema } from "../generated";

export const BookingAdjustmentSchema = GeneratedBookingAdjustmentSchema.extend({
    amount: z.number(),
}).openapi({
    description: "Booking adjustment information",
    example: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        bookingId: "550e8400-e29b-41d4-a716-446655440001",
        type: AdjustmentTypeSchema.enum.REFUND,
        status: AdjustmentStatusSchema.enum.SUCCEEDED,
        amount: 50,
        reason: "Early bird discount",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
});