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
// Sistema prompt para el chatbot de SCARS
const SYSTEM_PROMPT = `Eres un asistente virtual amable y profesional de SCARS, un taller de servicios automotrices en Piura con más de 30 años de experiencia.
Tu función es ayudar a los clientes con información detallada sobre nuestros servicios y el taller.

Información del negocio:
- Nombre: SCARS
- Dirección: AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22, Piura.
- Teléfono: 956 264 937 / 946 758 379
- Horarios de atención: 
  * Lunes a Sábado: 8:30 a.m. – 6:30 p.m.
  * Domingo: 8:30 a.m. – 1:00 p.m.

Servicios Principales:
1. Mantenimiento Preventivo (Básico y Plus): Incluye cambio de aceite/filtro, revisión de niveles, bujías, escaneo profesional y pulverizado de motor. El servicio Plus incluye lavado básico gratis.
2. Afinamiento Electrónico: Limpieza de obturador, sensores, prueba e inyectores, revisión sistema eléctrico y prueba de ruta.
3. Servicios Eléctricos y Mecánica General: Reparación de motor, frenos y sistemas eléctricos.
4. Diagnóstico Avanzado: Escaneo con tecnología Würth y Power Jet 260.

Instrucciones de comportamiento:
- Sé amable, profesional y conciso. Responde en español (localismo de Perú si es natural).
- Si no sabes algo específico, sugiere contactar al 956 264 937.
- No digas que eres un chatbot, indica que eres el asistente virtual de SCARS.
- Limitate a temas del taller. No inventes precios exactos si no están aquí; sugiere un presupuesto personalizado.
- Menciona que usamos herramientas de alta gama como Würth para mayor precisión.
`;

// Respuestas simuladas para modo de prueba (sin API key)
const getMockResponse = (message: string): string => {
  const msg = message.toLowerCase();

  // Ubicación
  if (msg.includes("donde") || msg.includes("ubicacion") || msg.includes("direccion") || msg.includes("ubicados")) {
    return "Estamos ubicados en Piura: AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22. ¡Te esperamos!";
  }

  // Horario
  if (msg.includes("horario") || msg.includes("abierto") || msg.includes("atienden") || msg.includes("abren")) {
    return "Atendemos de Lunes a Sábado de 8:30 a.m. a 6:30 p.m. Los domingos abrimos de 8:30 a.m. a 1:00 p.m.";
  }

  // Contacto
  if (msg.includes("telefono") || msg.includes("contacto") || msg.includes("celular") || msg.includes("llamar")) {
    return "Puedes contactarnos al 956 264 937 o al 946 758 379. También puedes escribirnos a hola.scars@gmail.com.";
  }

  // Servicios Generales
  if (msg.includes("servicio") || msg.includes("hacen") || msg.includes("ofrecen")) {
    return "Ofrecemos mantenimiento preventivo (Básico y Plus), afinamiento electrónico, mecánica general, servicios eléctricos y diagnóstico por escaneo con tecnología de alta gama.";
  }

  // Mantenimiento
  if (msg.includes("mantenimiento") || msg.includes("aceite") || msg.includes("revision")) {
    return "Nuestro mantenimiento preventivo incluye cambio de aceite, filtros, revisión de bujías, niveles y escaneo. Si eliges el mantenimiento 'Plus', ¡te incluimos un lavado básico gratis!";
  }

  // Afinamiento
  if (msg.includes("afinamiento") || msg.includes("inyectores") || msg.includes("limpieza")) {
    return "Realizamos afinamiento electrónico completo con limpieza de inyectores (incluye orrines), prueba en banco, limpieza de sensores y prueba de ruta para asegurar el mejor desempeño.";
  }

  // Tecnología / Herramientas
  if (msg.includes("tecnologia") || msg.includes("herramientas") || msg.includes("escaner") || msg.includes("escaneo")) {
    return "Contamos con tecnología de punta, incluyendo escáneres profesionales y herramientas Würth y Power Jet 260 para diagnósticos precisos.";
  }

  // Seguimiento
  if (msg.includes("seguimiento") || msg.includes("mi auto") || msg.includes("codigo")) {
    return "Para el seguimiento de tu vehículo, ingresa tu código de seguimiento en la sección correspondiente de nuestra web o consúltanos aquí mismo brindando tu código.";
  }

  // Saludo
  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("buenas")) {
    return "¡Hola! 👋 Soy el asistente virtual de SCARS. ¿En qué puedo ayudarte hoy? Consultas sobre servicios, ubicación o el estado de tu vehículo?";
  }

  // Respuesta genérica
  return "Gracias por tu consulta. En SCARS nos especializamos en servicios automotrices de alta calidad en Piura. Para una respuesta más detallada o presupuesto, por favor contáctanos al 956 264 937.";
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

