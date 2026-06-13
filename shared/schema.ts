import { z } from 'zod';

export const ExtractionResultSchema = z.object({
  loadNumber: z.string().optional(),
  brokerName: z.string().optional(),
  pickupDate: z.string().optional(),
  grossAmount: z.number().optional(),
  originCity: z.string().optional(),
  originState: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationState: z.string().optional(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export const ExtractionResponseSchema = z.object({
  success: z.boolean(),
  data: ExtractionResultSchema.optional(),
  error: z.string().optional(),
});

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;
