import Anthropic from "@anthropic-ai/sdk";

// Cache en memoria para respuestas frecuentes
const responseCache = {
    "¿Qué incluye el paquete?": `Tu paquete VIP incluye:
  • Vuelo redondo desde tu ciudad
  • Traslado aeropuerto - hotel
    • Noches en Hotel Xcaret Arte
  • Alimentos y bebidas premium (todo incluido)
  • Acceso a Xcaret, Xel-Há y más parques
  • Talleres de arte y actividades exclusivas
  • Atención VIP personalizada
  • Asesoría antes, durante y después del viaje`,

    "¿Cuánto cuesta para 2 personas?": `El paquete parte desde $4,500 USD por persona. Para 2 personas: aproximadamente $9,000 USD + vuelo según tu ciudad de origen. Este precio incluye hotel 5 estrellas, traslados, comidas premium y acceso a todos los parques.`,

  "¿Cuáles son las fechas disponibles?": `Tenemos disponibilidad todo el año. Fechas recomendadas:
  • Verano: Junio-Agosto (clima cálido, actividades acuáticas)
  • Otoño: Septiembre-Noviembre (paisajes hermosos)
  • Invierno: Diciembre-Enero (ideal para escapar del frío)
  • Primavera: Febrero-Mayo (clima perfecto)

  ¿Cuál fecha te interesa?`,

  "Quiero reservar": `¡Excelente! Para reservar tu paquete VIP:
  1. Confirma número de personas y fechas
  2. Proporciona datos de contacto
  3. Selecciona ciudad de origen (para calcular vuelo)
  4. Recibirás cotización final en minutos

  ¿Cuántas personas viajarían y qué fechas prefieres?`
};

// Palabras clave para detección rápida
const quickKeywords = {
  "incluye": "¿Qué incluye el paquete?",
  "precio": "¿Cuánto cuesta para 2 personas?",
  "costo": "¿Cuánto cuesta para 2 personas?",
  "fechas": "¿Cuáles son las fechas disponibles?",
  "disponible": "¿Cuáles son las fechas disponibles?",
  "reservar": "Quiero reservar",
  "booking": "Quiero reservar"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
}

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
}

  const lowerMessage = message.toLowerCase().trim();

  // PASO 1: Buscar en caché de respuestas directas
  for (const [key, value] of Object.entries(responseCache)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return res.status(200).json({ 
        response: value,
        cached: true,
        steps: 1
});
}
}

  // PASO 2: Detectar palabras clave y responder rápido
  for (const [keyword, cachedQuestion] of Object.entries(quickKeywords)) {
    if (lowerMessage.includes(keyword)) {
      const response = responseCache[cachedQuestion];
      return res.status(200).json({ 
        response: response,
        cached: true,
        steps: 1
});
}
}

  // PASO 3: Si no está en caché, usar IA pero con prompt optimizado
  try {
    const client = new Anthropic();

    const systemPrompt = `Eres el agente VIP de VIP Experiences, especialista en Hotel Xcaret Arte.
INFORMACIÓN CLAVE:
- Hotel 5 estrellas todo incluido en Cancún
- Precio desde $4,500 USD por persona (vuelo+hotel+traslados)
- Incluye: vuelo redondo, traslados, alimentos premium, acceso a parques Xcaret/Xel-Há
- Disponible todo el año

INSTRUCCIONES:
1. Responde SOLO en español
2. Sé cálido y profesional
3. Máximo 3 oraciones por respuesta
4. Si preguntan sobre reserva: pide ciudad de origen, número de personas y fechas
5. Si es pregunta fuera del tema: responde amablemente pero enfócate en el hotel`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300, // Limitar tokens para respuesta rápida
      messages: [
{
          role: "user",
          content: message
}
      ],
      system: systemPrompt
});

    const aiResponse = response.content[0].text;

    // PASO 4: Guardar en caché para futuras búsquedas similares
    responseCache[message] = aiResponse;

    return res.status(200).json({ 
      response: aiResponse,
      cached: false,
      steps: 3,
      model: "claude-3-5-sonnet"
});

} catch (error) {
    console.error("Error calling Anthropic API:", error);
    return res.status(500).json({ 
      error: "Error processing request",
      details: error.message,
      fallback: "Hubo un problema. Escríbenos a WhatsApp: wa.me/529981533910"
});
  }
}
