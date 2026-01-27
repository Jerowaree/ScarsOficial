import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
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

  // Respuestas predefinidas del frontend
  const getBotResponse = (message) => {
    const msg = message.toLowerCase();

    if (msg.includes("donde") || msg.includes("ubicacion") || msg.includes("direccion") || msg.includes("ubicados")) {
      return "Estamos ubicados en Piura: AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22. ¡Te esperamos!";
    }

    if (msg.includes("horario") || msg.includes("abierto") || msg.includes("atienden") || msg.includes("abren")) {
      return "Nuestro horario es:\nLunes a Sábado: 8:30 a.m. – 6:30 p.m.\nDomingo: 8:30 a.m. – 1:00 p.m (Previo Agendamiento).";
    }

    if (msg.includes("telefono") || msg.includes("contacto") || msg.includes("celular") || msg.includes("llamar") || msg.includes("numero")) {
      return "Puedes contactarnos al 956 264 937. ¡Estaremos encantados de atenderte!";
    }

    if (msg.includes("servicio") || msg.includes("hacen") || msg.includes("ofrecen")) {
      return "Ofrecemos mantenimiento preventivo (Básico y Plus), afinamiento electrónico, mecánica general, servicios eléctricos y diagnóstico por escaneo con tecnología de alta gama.";
    }

    if (msg.includes("mantenimiento") || msg.includes("aceite") || msg.includes("revision")) {
      return "Nuestro mantenimiento preventivo incluye cambio de aceite, filtros, revisión de bujías, niveles y escaneo. El servicio 'Plus' incluye lavado básico gratis.";
    }

    if (msg.includes("afinamiento") || msg.includes("inyectores") || msg.includes("limpieza")) {
      return "Realizamos afinamiento electrónico completo con limpieza de inyectores (incluye orrines), prueba en banco, limpieza de sensores y prueba de ruta.";
    }

    if (msg.includes("seguimiento") || msg.includes("mi auto") || msg.includes("codigo")) {
      return "La función de seguimiento en línea estará disponible próximamente en nuestra web. Por ahora, puedes consultarme por aquí o llamarnos al 956 264 937.";
    }

    if (msg.includes("hola") || msg.includes("buenos") || msg.includes("buenas")) {
      return "¡Hola! 👋 Soy el asistente virtual de SCARS. ¿En qué puedo ayudarte hoy? Puedes preguntarme por nuestra ubicación, horarios, servicios o el estado de tu vehículo.";
    }

    return "Gracias por tu consulta. En SCARS nos especializamos en servicios automotrices de alta calidad en Piura. Para una respuesta más detallada o presupuesto, por favor contáctanos al 956 264 937.";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simular un pequeño delay para que se sienta natural
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage.content);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botResponse },
      ]);
      setLoading(false);
    }, 600);
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

