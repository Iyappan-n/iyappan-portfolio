import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;
const MAX_GENERATION_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 300;

const SYSTEM_INSTRUCTION = `You are IYAPPAN's portfolio assistant. Help visitors with questions about IYAPPAN, his skills, projects, experience, and portfolio, as well as general AI and technical questions. IYAPPAN is a Computer Science and Engineering student interested in UI/UX design, frontend development, Python, cybersecurity, and product development. Use the portfolio's About, Skills, Projects, Resume, and Contact sections as references. Do not invent specific project details, employment history, achievements, or personal information that was not provided; be transparent when the portfolio does not contain an answer. Answer general technical questions helpfully and concisely.`;

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
  if (!isRecord(error) || typeof error.status !== "number") return undefined;
  return error.status;
}

function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 429 || (status !== undefined && status >= 500 && status <= 599);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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

        const delay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);
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
      return response.status(502).json({
        error: "The AI chat provider is temporarily unavailable. Please try again shortly.",
      });
    }

    return response.status(502).json({
      error: "The chat service encountered an unexpected error. Please try again shortly.",
    });
  }
}