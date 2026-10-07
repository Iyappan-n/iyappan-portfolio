import { useEffect, useRef, useState } from "react";
import "./PortfolioChatbot.css";

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi 👋 I'm IYAPPAN AI. Ask me anything about IYAPPAN, his skills, projects, or experience.",
    },
  ]);

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    setRecognitionSupported(
      Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition),
    );
    setSpeechSynthesisSupported(
      "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
    );

    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.stop();
        } catch {
          // The browser may already have ended recognition.
        }
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopListening = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // The browser may already have ended recognition.
      }
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (speechSynthesisSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!speechSynthesisSupported) {
      setVoiceNotice("Voice output is not supported in this browser.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setVoiceNotice("The spoken response could not be played.");
      };
      setVoiceNotice("");
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      setVoiceNotice("The spoken response could not be played.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const RecognitionConstructor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!RecognitionConstructor) {
      setRecognitionSupported(false);
      setVoiceNotice("Voice input is not supported in this browser. You can still type your message.");
      return;
    }

    let recognition: SpeechRecognitionInstance;
    try {
      recognition = new RecognitionConstructor();
    } catch {
      setVoiceNotice("Voice input could not be started. Please try again or type your message.");
      return;
    }
    recognition.lang = navigator.language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setVoiceNotice("");

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) setInput(transcript);

      const finalTranscript = results
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (finalTranscript && recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setIsListening(false);
        try {
          recognition.stop();
        } catch {
          // Recognition may already have stopped after the final result.
        }
        setInput(finalTranscript);
        setVoiceNotice("Speech recognized. Review the text and select Send when ready.");
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      recognitionRef.current = null;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceNotice("Microphone access was denied. Allow microphone access or type your message.");
      } else if (event.error !== "aborted") {
        setVoiceNotice("Voice input could not be completed. Please try again or type your message.");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceNotice("Voice input could not be started. Please try again or type your message.");
    }
  };

  const closeChatbot = () => {
    stopListening();
    stopSpeaking();
    setOpen(false);
  };

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
        body: JSON.stringify({
          message,
          history: messages.map(({ role, text: messageText }) => ({ role, text: messageText })),
        }),
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
      speakText(reply);
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
              onClick={closeChatbot}
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
            <div className="chatbot-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                aria-label="Message IYAPPAN AI"
                disabled={isLoading}
              />

              <button
                type="button"
                className={`chatbot-voice-button${isListening ? " listening" : ""}`}
                onClick={toggleListening}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                aria-pressed={isListening}
                title={recognitionSupported ? "Voice input" : "Voice input unsupported"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-4 0h8" />
                </svg>
              </button>

              <button
                type="button"
                className={`chatbot-voice-button chatbot-speech-button${isSpeaking ? " speaking" : ""}`}
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                    return;
                  }
                  const latestBotMessage = [...messages].reverse().find((item) => item.role === "bot");
                  if (latestBotMessage) speakText(latestBotMessage.text);
                }}
                aria-label={isSpeaking ? "Stop spoken response" : "Play latest response aloud"}
                title={speechSynthesisSupported ? (isSpeaking ? "Stop speech" : "Play latest response") : "Speech output unsupported"}
                disabled={!speechSynthesisSupported}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                  {isSpeaking ? <path d="M17 9v6m4-6v6" /> : <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11" />}
                </svg>
              </button>

              <button type="submit" aria-label="Send message" disabled={isLoading || !input.trim()}>
                ➤
              </button>
            </div>
            <div className="chatbot-voice-status" role="status" aria-live="polite">
              {isListening ? "Listening... Speak now, or select the microphone to stop." : voiceNotice}
            </div>
          </form>
        </div>
      )}

      <button
        className={`chatbot-launcher ${open ? "active" : ""}`}
        onClick={() => (open ? closeChatbot() : setOpen(true))}
        aria-label={open ? "Close IYAPPAN AI" : "Open IYAPPAN AI"}
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