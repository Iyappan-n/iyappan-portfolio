import { useState } from "react";
import "./PortfolioChatbot.css";

type Message = {
  role: "user" | "bot";
  text: string;
};

const quickQuestions = [
  "Tell me about IYAPPAN",
  "What are his skills?",
  "Show me his projects",
  "How can I contact him?",
];

function parseJsonBody(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function isChatMessage(payload: unknown): payload is { message: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  );
}

function isChatError(payload: unknown): payload is { error: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  );
}

export default function PortfolioChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi 👋 I'm IYAPPAN AI. Ask me anything about IYAPPAN, his skills, projects, or experience.",
    },
  ]);

  const sendMessage = async (text: string) => {
    const message = text.trim();

    if (!message || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const responseBody = await result.text();

      if (!result.ok) {
        const errorPayload = parseJsonBody(responseBody);
        const errorMessage = isChatError(errorPayload)
          ? errorPayload.error
          : `Chat is temporarily unavailable (error ${result.status}). Please try again.`;
        throw new Error(errorMessage);
      }

      const payload = parseJsonBody(responseBody);
      if (!isChatMessage(payload)) {
        throw new Error("The chat service returned an unreadable response. Please try again.");
      }

      const reply = payload.message;
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "I couldn't reach the chat service just now. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="portfolio-chatbot">
          <div className="chatbot-header">
            <div>
              <div className="chatbot-title">✨ IYAPPAN AI</div>
              <div className="chatbot-status">
                <span /> Online
              </div>
            </div>

            <button
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.role}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && <div className="chat-message bot">Thinking...</div>}
          </div>

          {messages.length === 1 && (
            <div className="chatbot-quick-actions">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form
            className="chatbot-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
            />

            <button type="submit" aria-label="Send message" disabled={isLoading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        className={`chatbot-launcher ${open ? "active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open IYAPPAN AI"
      >
        {open ? (
          "×"
        ) : (
          <>
            <img src="/iyappan-ai-bot-logo.png" alt="IYAPPAN AI" className="chatbot-logo" />
            <span className="chatbot-launcher-label">CHATBOT</span>
          </>
        )}
      </button>
    </>
  );
}