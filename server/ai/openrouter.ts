/**
 * OpenRouter AI provider - OpenAI-compatible API client.
 * Supports vision models for PDF/image extraction.
 * Includes retries, timeout, and rate-limit handling.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 30_000;
const RETRY_DELAYS = [500, 2000];

interface OpenRouterMessage {
  role: 'system' | 'user';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message?: string; code?: number };
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://loadtocash.app',
          'X-Title': 'Load to Cash',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Rate limit - wait and retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
        console.warn(`[OpenRouter] Rate limited, retrying after ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API ${response.status}: ${errText}`);
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (data.error) {
        throw new Error(`OpenRouter error: ${data.error.message || 'Unknown'}`);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenRouter returned empty response');
      }

      return content;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (lastError.name === 'AbortError') {
        console.warn(`[OpenRouter] Timeout on attempt ${attempt + 1}`);
      } else {
        console.warn(`[OpenRouter] Attempt ${attempt + 1} failed:`, lastError.message);
      }

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  throw lastError || new Error('OpenRouter request failed after retries');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
