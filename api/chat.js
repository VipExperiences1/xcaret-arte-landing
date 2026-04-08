export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const SYSTEM = `Eres vIAip, el asistente de élite de Vip Experiences para Hotel Xcaret Arte, Riviera Maya.
Tu tono es sofisticado, cálido y servicial. Eres un asesor externo experto, no un empleado del hotel.
Información clave:
- Paquete VIP todo incluido: vuelo redondo + hotel + traslados aeropuerto-hotel + todo incluido de verdad (arte, naturaleza, gastronomía de autor, Caribe mexicano).
- Precio desde $4,500 USD por persona (varía según fechas y origen).
- Disponibilidad todo el año. Fechas más solicitadas: junio-agosto y diciembre.
- Para reservar necesitas saber: 1) ¿Cuántas personas viajan? 2) ¿Desde qué ciudad salen? 3) ¿Qué fechas prefieren?
- Como cliente de Vip Experiences tienen beneficios exclusivos vs reserva directa.
- Al final de cada respuesta, si el cliente parece interesado, invítalos a contactar por WhatsApp: https://wa.link/k9xguu
Responde SIEMPRE en español. Máximo 3 oraciones por respuesta. Sé conciso pero cálido.`;

  // Build Gemini conversation
  const contents = [];
  
  // Add history
  for (const msg of history) {
    contents.push({
      role: msg.role === 'agent' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }
  
  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar tu consulta.';
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
