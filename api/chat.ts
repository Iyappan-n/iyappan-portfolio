import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;
const MAX_GENERATION_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 5000;

const SYSTEM_INSTRUCTION = `You are a helpful general-purpose AI assistant and IYAPPAN's portfolio assistant. Answer general knowledge, AI, coding, technical, educational, and everyday questions directly and normally; do not redirect unrelated general questions to the portfolio or refuse them because they are not about IYAPPAN. For questions specifically about IYAPPAN, use this portfolio context: he is a Computer Science and Engineering student interested in UI/UX design, frontend development, Python, cybersecurity, and product development. Use the portfolio's About, Skills, Projects, Experience, Resume, and Contact information when relevant. Do not invent specific project details, employment history, achievements, or personal information that is not provided; be transparent when portfolio details are unavailable. Keep answers clear, useful, and concise.`;

type ChatHistoryTurn = {
  role: "user" | "model";
  parts: { text: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHistoryTurn(value: unknown): value is { role: string; text: string } {
  return (
    isRecord(value) &&
    typeof value.role === "string" &&
    typeof value.text === "string"
  );
}

function getSafeHistory(value: unknown): ChatHistoryTurn[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isHistoryTurn)
    .filter((turn) => turn.role === "user" || turn.role === "bot" || turn.role === "model")
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role === "user" ? "user" : "model",
      parts: [{ text: turn.text.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }],
    }));
}

function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const status = error.status;
  if (typeof status === "number") return status;
  if (typeof status === "string" && /^\d{3}$/.test(status)) return Number(status);

  if (isRecord(error.response)) {
    const responseStatus = error.response.status;
    if (typeof responseStatus === "number") return responseStatus;
    if (typeof responseStatus === "string" && /^\d{3}$/.test(responseStatus)) {
      return Number(responseStatus);
    }
  }

  return undefined;
}

function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 429 || (status !== undefined && status >= 500 && status <= 599);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getRetryAfterMs(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const response = isRecord(error.response) ? error.response : undefined;
  const headers = response?.headers ?? error.headers;
  if (!isRecord(headers) || typeof headers.get !== "function") return undefined;

  let retryAfter: unknown;
  try {
    retryAfter = (headers.get as (name: string) => unknown).call(headers, "retry-after");
  } catch {
    return undefined;
  }

  if (typeof retryAfter !== "string") return undefined;

  const seconds = Number(retryAfter);
  const delay = Number.isFinite(seconds)
    ? seconds * 1000
    : Date.parse(retryAfter) - Date.now();

  if (!Number.isFinite(delay) || delay <= 0) return undefined;
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return response.status(405).json({ error: "Method not allowed." });
    }

    const body: unknown = request.body;
    if (!isRecord(body) || typeof body.message !== "string") {
      return response.status(400).json({ error: "Please send a message." });
    }

    const message = body.message.trim();
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return response.status(400).json({
        error: `Messages must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return response.status(500).json({
        error: "The chat service is not configured. Please contact the site owner.",
      });
    }

    const genAI = new GoogleGenAI({ apiKey });
    let result;
    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        result = await genAI.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            ...getSafeHistory(body.history),
            { role: "user", parts: [{ text: message }] },
          ],
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
        break;
      } catch (error: unknown) {
        const status = getErrorStatus(error);
        const code = isRecord(error) && typeof error.code === "string" ? error.code : undefined;
        console.error("Gemini chat attempt failed", {
          attempt,
          status,
          code,
          name: error instanceof Error ? error.name : "UnknownError",
        });

        if (!isRetryableError(error) || attempt === MAX_GENERATION_ATTEMPTS) {
          throw error;
        }

        const exponentialDelay = Math.min(
          INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
          MAX_RETRY_DELAY_MS,
        );
        const jitteredDelay = exponentialDelay * (0.8 + Math.random() * 0.4);
        const delay = Math.min(
          Math.max(jitteredDelay, getRetryAfterMs(error) ?? 0),
          MAX_RETRY_DELAY_MS,
        );
        await wait(delay);
      }
    }

    if (!result) {
      return response.status(503).json({
        error: "The AI chat provider is temporarily unavailable. Please try again shortly.",
      });
    }

    const answer = result.text?.trim() ?? "";
    if (!answer) {
      return response.status(502).json({
        error: "I couldn't generate a reply just now. Please try again.",
      });
    }

    return response.status(200).json({ message: answer });
  } catch (error: unknown) {
    const errorDetails = isRecord(error) ? error : {};
    const status = typeof errorDetails.status === "number" ? errorDetails.status : undefined;
    const code = typeof errorDetails.code === "string" ? errorDetails.code : undefined;
    console.error("Gemini chat request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      status,
      code,
    });

    if (status === 401 || status === 403) {
      return response.status(502).json({
        error: "The chat service could not authenticate with its AI provider. Please contact the site owner.",
      });
    }

    if (status === 429) {
      return response.status(503).json({
        error: "The chat service is busy or has reached its usage limit. Please try again later.",
      });
    }

    if (status !== undefined && status >= 500) {
      return response.status(503).json({
        error: "The AI chat provider is temporarily unavailable. Please try again shortly.",
      });
    }

    return response.status(502).json({
      error: "The chat service encountered an unexpected error. Please try again shortly.",
    });
  }
}