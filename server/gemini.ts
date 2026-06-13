import { ExtractionResponse, ExtractionResultSchema } from '../shared/schema.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const EXTRACTION_PROMPT = `You are a data extraction assistant for trucking dispatch. 
Extract ONLY the following fields from this rate confirmation document:
- loadNumber: The load or reference number
- brokerName: The broker or shipper company name
- pickupDate: The pickup date in YYYY-MM-DD format
- grossAmount: The total gross pay amount as a number (no currency symbols)
- originCity: The pickup/origin city
- originState: The pickup/origin state (2-letter abbreviation)
- destinationCity: The delivery/destination city
- destinationState: The delivery/destination state (2-letter abbreviation)

DO NOT extract: carrier info, driver info, MC numbers, phone numbers, emails, commodity, or instructions.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.
If a field cannot be found, omit it from the JSON.

Example response:
{"loadNumber":"12345","brokerName":"ABC Logistics","pickupDate":"2025-01-15","grossAmount":2500.00,"originCity":"Chicago","originState":"IL","destinationCity":"Dallas","destinationState":"TX"}`;

function mimeToGeminiPart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      mimeType,
      data: buffer.toString('base64'),
    },
  };
}

export async function extractWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  apiKey: string
): Promise<ExtractionResponse> {

  console.log("MODEL:", GEMINI_MODEL);
  console.log("KEY:", apiKey.substring(0, 15));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

 const body = {
  contents: [
    {
      parts: [
        { text: EXTRACTION_PROMPT },
        mimeToGeminiPart(fileBuffer, mimeType),
      ],
    },
  ],
  generationConfig: {
    temperature: 0,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
};

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

 const geminiResponse = await response.json() as {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

console.log("FULL GEMINI RESPONSE:");
console.log(JSON.stringify(geminiResponse, null, 2));

const rawText =
  geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

console.log("RAW GEMINI RESPONSE:");
console.log(rawText);

const cleaned = rawText.replace(/```json|```/g, '').trim();

const firstBrace = cleaned.indexOf("{");
const lastBrace = cleaned.lastIndexOf("}");

const safeJson =
  firstBrace >= 0 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

let parsed: unknown;

try {
  parsed = JSON.parse(safeJson);
} catch {
  throw new Error(
    `Failed to parse Gemini response as JSON: ${rawText.slice(0, 500)}`
  );
}

  const validated = ExtractionResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('Gemini returned unexpected data shape');
  }

  return { success: true, data: validated.data };
}
