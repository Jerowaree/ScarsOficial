import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import publicApi from "@/api/publicAxios";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "¡Hola! 👋 Soy el asistente virtual de SCARS. ¿En qué puedo ayudarte hoy? Puedo ayudarte con información sobre nuestros servicios, seguimiento de servicios, o cualquier consulta general.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Construir historial de conversación (sin el mensaje de sistema)
      const conversationHistory = newMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await publicApi.post("/chatbot/chat/public", {
        message: userMessage.content,
        conversationHistory,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);

      let errorMessage = "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.";

      if (error.response?.status === 429) {
        errorMessage = "Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.";
      } else if (error.response?.status === 503) {
        errorMessage = "El servicio de chatbot no está disponible en este momento. Por favor, contáctanos directamente.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.error;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chatbot"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Bot size={20} />
              <span>Asistente SCARS</span>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-reset"
                onClick={resetChat}
                aria-label="Reiniciar conversación"
                title="Nueva conversación"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
              <button
                className="chatbot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar chatbot"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="chatbot-avatar">
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="chatbot-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-message assistant">
                <div className="chatbot-avatar">
                  <Bot size={16} />
                </div>
                <div className="chatbot-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="chatbot-input"
              maxLength={500}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="chatbot-send"
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

