import { ExtractionResponse, ExtractionResultSchema } from '../shared/schema.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const EXTRACTION_PROMPT = `You are a precise data extraction assistant for trucking dispatch.
Analyze this rate confirmation document and extract the billing and dispatch details.

Rules:
1. Extract the primary load or reference number (e.g. Load #, Confirmation #, Ref #, Order #).
2. Extract the broker company name (e.g. TQL, C.H. Robinson, Echo, Coyote). Do not extract carrier details.
3. Extract the pickup date. Clean and format it as YYYY-MM-DD.
4. Extract the gross amount or carrier pay (the total flat rate, line haul, plus any fuel surcharges).
5. Extract the pickup origin city and state.
6. Extract the delivery destination city and state.
7. Ensure state abbreviations are always 2-letter uppercase letters (e.g. TX, IL, FL, CA).`;

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
  console.log("KEY:", apiKey ? "****configured" : "NOT SET");

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
      responseSchema: {
        type: "OBJECT",
        properties: {
          loadNumber: {
            type: "STRING",
            description: "The load confirmation or reference number."
          },
          brokerName: {
            type: "STRING",
            description: "The broker/shipper company name."
          },
          pickupDate: {
            type: "STRING",
            description: "The pickup date formatted strictly as YYYY-MM-DD. If year is missing, infer the logical year."
          },
          grossAmount: {
            type: "NUMBER",
            description: "The total gross carrier revenue (rate + fuel surcharge) as a number."
          },
          originCity: {
            type: "STRING",
            description: "Origin city."
          },
          originState: {
            type: "STRING",
            description: "Origin 2-letter state abbreviation."
          },
          destinationCity: {
            type: "STRING",
            description: "Destination city."
          },
          destinationState: {
            type: "STRING",
            description: "Destination 2-letter state abbreviation."
          }
        },
        required: [
          "loadNumber",
          "brokerName",
          "pickupDate",
          "grossAmount",
          "originCity",
          "originState",
          "destinationCity",
          "destinationState"
        ]
      }
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

  const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  // Clean raw markdown if any
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const safeJson = firstBrace >= 0 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  let parsed: any;
  try {
    parsed = JSON.parse(safeJson);
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${rawText.slice(0, 500)}`);
  }

  // Normalization logic: Clean states and check formats
  if (typeof parsed === 'object' && parsed !== null) {
    if (parsed.originState && typeof parsed.originState === 'string') {
      parsed.originState = parsed.originState.trim().toUpperCase().slice(0, 2);
    }
    if (parsed.destinationState && typeof parsed.destinationState === 'string') {
      parsed.destinationState = parsed.destinationState.trim().toUpperCase().slice(0, 2);
    }
    if (parsed.pickupDate && typeof parsed.pickupDate === 'string') {
      const dateStr = parsed.pickupDate.trim();
      const slashMDY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr);
      const dashMDY = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(dateStr);
      if (slashMDY) {
        parsed.pickupDate = `${slashMDY[3]}-${slashMDY[1].padStart(2, '0')}-${slashMDY[2].padStart(2, '0')}`;
      } else if (dashMDY) {
        parsed.pickupDate = `${dashMDY[3]}-${dashMDY[1].padStart(2, '0')}-${dashMDY[2].padStart(2, '0')}`;
      }
    }
    if (parsed.grossAmount) {
      parsed.grossAmount = Math.max(0, Number(parsed.grossAmount) || 0);
    }
  }

  const validated = ExtractionResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('Gemini returned unexpected data shape');
  }

  return { success: true, data: validated.data };
}
