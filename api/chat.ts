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
        error: "Chat is temporarily unavailable. Please try again later.",
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
  } catch {
    return response.status(502).json({
      error: "I couldn't reach the chat service just now. Please try again.",
    });
  }
}