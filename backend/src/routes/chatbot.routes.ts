// src/routes/chatbot.routes.ts
import { Router } from "express";
import OpenAI from "openai";
import { rateLimit } from "express-rate-limit";

const r = Router();

// Limitador específico para el chatbot (evitar consumo excesivo de tokens)
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15, // Máximo 15 mensajes por hora por IP
  message: { error: "Límite de mensajes alcanzado. Intenta en una hora." }
});

// Inicializar cliente de OpenAI (validar que exista la key)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI configurado correctamente");
  } else {
    console.warn("⚠️  OPENAI_API_KEY no configurada. El chatbot no funcionará.");
  }
} catch (error) {
  console.error("❌ Error al inicializar OpenAI:", error);
}

// Sistema prompt para el chatbot de SCARS
const SYSTEM_PROMPT = `Eres un asistente virtual amable y profesional de SCARS, un taller de servicios automotrices.
Tu función es ayudar a los clientes con:
- Información sobre servicios (pintura automotriz, reparación, mantenimiento)
- Consultas sobre seguimiento de servicios
- Respuestas generales sobre el taller
- Recomendaciones básicas

Sé amable, profesional y conciso. Responde en español, los clientes son de Perú.
Si no sabes algo específico, sugiere contactar directamente al taller.
Información del negocio:
- Nombre: SCARS
- Servicios: Pintura automotriz, reparación, mantenimiento de vehículos
- Los clientes pueden consultar el seguimiento de sus servicios con un código de seguimiento
- Mantén las respuestas breves y útiles (máximo 3-4 oraciones)
- No digas que eres un chatbot, digas que eres un asistente virtual de SCARS
- Solamente responde con la información que te proporciono, no inventes información.
- Limitate a responder preguntas relacionadas con el taller de servicios automotrices.
`;

// Respuestas simuladas para modo de prueba (sin API key)
const getMockResponse = (message: string): string => {
  const msg = message.toLowerCase();

  if (msg.includes("hola") || msg.includes("buenos días") || msg.includes("buenas tardes")) {
    return "¡Hola! 👋 Bienvenido a SCARS. Estoy aquí para ayudarte con información sobre nuestros servicios automotrices, seguimiento de servicios o cualquier consulta que tengas. ¿En qué puedo asistirte?";
  }

  if (msg.includes("servicio") || msg.includes("servicios")) {
    return "En SCARS ofrecemos servicios de pintura automotriz, reparación y mantenimiento de vehículos. ¿Hay algún servicio específico sobre el que te gustaría saber más?";
  }

  if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuanto")) {
    return "Los precios varían según el tipo de servicio y el vehículo. Te recomiendo contactarnos directamente para obtener un presupuesto personalizado. ¿Te gustaría que te ayude con algo más?";
  }

  if (msg.includes("seguimiento") || msg.includes("código") || msg.includes("codigo")) {
    return "Para consultar el seguimiento de tu servicio, necesitas el código de seguimiento que te proporcionamos. Puedes ingresarlo en la sección 'Seguimiento' de nuestra página web. ¿Tienes tu código a mano?";
  }

  if (msg.includes("horario") || msg.includes("horarios") || msg.includes("abierto")) {
    return "Para conocer nuestros horarios de atención, te sugiero contactarnos directamente. Estaremos encantados de atenderte. ¿Hay algo más en lo que pueda ayudarte?";
  }

  if (msg.includes("contacto") || msg.includes("teléfono") || msg.includes("telefono")) {
    return "Para contactarnos, puedes usar el formulario de contacto en nuestra página web o visitarnos directamente. ¿Necesitas ayuda con algo más?";
  }

  // Respuesta genérica
  return "Entiendo tu consulta. En SCARS nos especializamos en servicios automotrices como pintura, reparación y mantenimiento. Si necesitas información más específica, te recomiendo contactarnos directamente. ¿Hay algo más en lo que pueda ayudarte?";
};

// Endpoint público para chat (sin autenticación)
r.post("/chat/public", chatLimiter, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Validación
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Mensaje demasiado largo (máximo 500 caracteres)" });
    }

    // Construir historial de mensajes
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Agregar historial (últimos 8 mensajes para controlar tokens)
    const recentHistory = conversationHistory.slice(-8);
    recentHistory.forEach((msg: any) => {
      if (msg.role && msg.content) {
        messages.push({ role: msg.role, content: msg.content.substring(0, 500) });
      }
    });

    // Agregar mensaje actual
    messages.push({ role: "user", content: message });

    // Si no hay API key, usar modo de prueba (mock)
    if (!openai) {
      console.log("⚠️  [Chatbot] Modo de prueba activado (sin API key)");
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = getMockResponse(message);
      return res.json({
        response,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        mock: true, // Indicador de que es respuesta simulada
      });
    }

    // Llamar a OpenAI con límites de tokens
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 250, // Límite bajo para controlar costos
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

    // Log de uso (opcional, para monitoreo)
    if (completion.usage) {
      console.log(`[Chatbot] Tokens usados: ${completion.usage.total_tokens} (input: ${completion.usage.prompt_tokens}, output: ${completion.usage.completion_tokens})`);
    }

    res.json({
      response,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("❌ Error en OpenAI:", error);

    // Fallback: Si falla la API, usar respuestas simuladas para que el usuario no vea un error feo
    console.log("⚠️ Usando respuesta de respaldo (fallback) debido al error");

    // Intentar obtener una respuesta simulada basada en el mensaje original
    // Si no se puede, usar un mensaje genérico de error amigable
    let fallbackResponse = "Lo siento, estoy teniendo problemas momentáneos de conexión. Por favor, intenta de nuevo en unos segundos o contáctanos por teléfono.";

    try {
      const { message } = req.body;
      if (message) {
        fallbackResponse = getMockResponse(message);
      }
    } catch (e) {
      // Ignorar error al generar mock
    }

    // Retornar 200 con la respuesta de fallback para que el chat continúe
    return res.json({
      response: fallbackResponse,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      fallback: true, // Indicador de que fue un fallback
      error_details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint de salud/verificación
r.get("/health", (req, res) => {
  res.json({
    available: openai !== null,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

export default r;

