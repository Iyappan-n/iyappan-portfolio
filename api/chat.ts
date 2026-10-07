import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_MESSAGE_LENGTH = 2000;

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
    if (
      typeof body !== "object" ||
      body === null ||
      !("message" in body) ||
      typeof body.message !== "string"
    ) {
      return response.status(400).json({ error: "Please send a message." });
    }

    const message = body.message.trim();
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return response.status(400).json({
        error: `Messages must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return response.status(500).json({
        error: "The chat service is not configured. Please contact the site owner.",
      });
    }

    const openai = new OpenAI({ apiKey });
    const result = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are IYAPPAN's portfolio assistant. Answer helpfully and concisely using information about IYAPPAN's portfolio. Do not invent personal details; direct visitors to the portfolio sections when information is not available.",
      input: message,
    });

    const answer = result.output_text.trim();
    if (!answer) {
      return response.status(502).json({
        error: "I couldn't generate a reply just now. Please try again.",
      });
    }

    return response.status(200).json({ message: answer });
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI chat request failed", {
        name: error.name,
        status: error.status,
        code: error.code,
        requestId: error.requestID,
      });

      if (error instanceof OpenAI.AuthenticationError) {
        return response.status(502).json({
          error: "The chat service could not authenticate with its AI provider. Please contact the site owner.",
        });
      }

      if (error instanceof OpenAI.RateLimitError) {
        const quotaReached = error.code === "insufficient_quota";
        return response.status(503).json({
          error: quotaReached
            ? "The chat service has reached its usage limit. Please try again later."
            : "The chat service is busy. Please try again in a moment.",
        });
      }

      if (error instanceof OpenAI.APIConnectionError) {
        return response.status(502).json({
          error: "The chat service could not connect to its AI provider. Please try again shortly.",
        });
      }

      if (error.status !== undefined && error.status >= 500) {
        return response.status(502).json({
          error: "The AI chat provider is temporarily unavailable. Please try again shortly.",
        });
      }

      return response.status(502).json({
        error: "The AI chat provider could not process this request. Please try again later.",
      });
    }

    console.error("Unexpected chatbot API error", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return response.status(502).json({
      error: "The chat service encountered an unexpected error. Please try again shortly.",
    });
  }
}