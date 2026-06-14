/**
 * Extraction service - extracts structured data from trucking rate confirmations.
 * Uses OpenRouter vision models for PDF and image processing.
 */

import { callOpenRouter } from './openrouter.js';
import { EXTRACTION_PROMPT } from './prompts.js';
import { ExtractionResponse, ExtractionResultSchema } from '../../shared/schema.js';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

/**
 * Validate uploaded file before processing.
 */
export function validateFile(mimeType: string, size: number): string | null {
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return `Unsupported file type: ${mimeType}. Use PDF, PNG, JPG, or WEBP.`;
  }
  if (size > 20 * 1024 * 1024) {
    return 'File exceeds 20MB limit.';
  }
  return null;
}

/**
 * Extract load data from a file buffer using OpenRouter vision API.
 * For PDFs: sends as application/pdf data URL (supported by many vision models).
 * For images: sends as image data URL directly.
 */
export async function extractFromFile(
  fileBuffer: Buffer,
  mimeType: string,
  apiKey: string,
  model: string
): Promise<ExtractionResponse> {
  const base64Data = fileBuffer.toString('base64');
  
  // For PDFs, we send as image/png with a note that it's a PDF document
  // Many free models don't support application/pdf but do support images
  // We also try with the original mime type first for models that support it
  const isPdf = mimeType === 'application/pdf';
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const messages = [
    {
      role: 'system' as const,
      content: EXTRACTION_PROMPT,
    },
    {
      role: 'user' as const,
      content: isPdf
        ? [
            {
              type: 'text' as const,
              text: `This is a trucking rate confirmation PDF document encoded in base64. Extract the load details and return JSON only.\n\nBase64 PDF content (first 2000 chars for reference): ${base64Data.slice(0, 2000)}`,
            },
          ]
        : [
            {
              type: 'text' as const,
              text: 'Extract the load details from this rate confirmation document. Return JSON only.',
            },
            {
              type: 'image_url' as const,
              image_url: { url: dataUrl },
            },
          ],
    },
  ];

  const rawText = await callOpenRouter(messages, apiKey, model);

  // Parse JSON from response - handle potential markdown wrapping
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonStr = firstBrace >= 0 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${rawText.slice(0, 300)}`);
  }

  // Normalize extracted data
  parsed = normalizeExtraction(parsed);

  // Validate against schema
  const validated = ExtractionResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid extraction shape: ${validated.error.message}`);
  }

  return { success: true, data: validated.data };
}

/**
 * Normalize extracted data - clean states, dates, amounts.
 */
function normalizeExtraction(data: Record<string, unknown>): Record<string, unknown> {
  // State codes: uppercase 2-letter
  if (typeof data.originState === 'string') {
    data.originState = data.originState.trim().toUpperCase().slice(0, 2);
  }
  if (typeof data.destinationState === 'string') {
    data.destinationState = data.destinationState.trim().toUpperCase().slice(0, 2);
  }

  // Date normalization: convert MM/DD/YYYY or MM-DD-YYYY to YYYY-MM-DD
  if (typeof data.pickupDate === 'string') {
    const dateStr = data.pickupDate.trim();
    const slashMDY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr);
    const dashMDY = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(dateStr);
    if (slashMDY) {
      data.pickupDate = `${slashMDY[3]}-${slashMDY[1].padStart(2, '0')}-${slashMDY[2].padStart(2, '0')}`;
    } else if (dashMDY) {
      data.pickupDate = `${dashMDY[3]}-${dashMDY[1].padStart(2, '0')}-${dashMDY[2].padStart(2, '0')}`;
    }
  }

  // Amount: ensure positive number
  if (data.grossAmount !== undefined) {
    data.grossAmount = Math.max(0, Number(data.grossAmount) || 0);
  }

  return data;
}
