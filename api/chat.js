const Anthropic = require("@anthropic-ai/sdk");

// In-memory cache (resets per cold start, but handles hot requests instantly)
const CACHE = {
  "incluye": "Tu paquete VIP incluye vuelo redondo, traslados aeropuerto-hotel, noches en Hotel Xcaret Arte 5 estrellas, alimentos y bebidas premium todo incluido, acceso a parques Xcaret, Xel-Há y más, talleres de arte y atención VIP personalizada. ¿Te gustaría cotizar?",
  "precio": "El paquete parte desde $4,500 USD por persona (vuelo + hotel + traslados + todo incluido). Para 2 personas aproximadamente $9,000 USD. El precio final depende de tu ciudad de origen y fechas. ¿Cuándo te gustaría viajar?",
  "fecha": "Tenemos disponibilidad todo el año. Las fechas más solicitadas son junio-agosto (verano) y diciembre-enero (temporada alta). ¿Qué fechas tienes en mente?",
  "reserva": "¡Perfecto! Para reservar necesito saber: 1) ¿Cuántas personas viajan? 2) ¿Desde qué ciudad? 3) ¿Qué fechas prefieres? Con eso te doy tu cotización exacta en minutos.",
  "cotiza": "¡Con gusto! Solo dime: ¿cuántas personas viajan, desde qué ciudad y qué fechas prefieres? Te envío tu cotización VIP de inmediato.",
  "hola": "¡Hola! Soy tu agente VIP de Xcaret Arte. Estoy aquí para ayudarte a planear tu experiencia 5 estrellas en la Riviera Maya. ¿Qué te gustaría saber?",
};

const SYSTEM = `Eres el agente VIP de VIP Experiences para Hotel Xcaret Arte, Riviera Maya.
Precio desde $4,500 USD/persona (vuelo+hotel+traslados+todo incluido).
Responde en español, cálido y breve (máximo 2 oraciones). Si quieren reservar, pide: personas, ciudad origen y fechas.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  // Step 1: Check keyword cache (instant, <5ms)
  const key = message.toLowerCase();
  for (const [kw, reply] of Object.entries(CACHE)) {
    if (key.includes(kw)) {
      return res.status(200).json({ response: reply, cached: true });
    }
  }

  // Step 2: Call Claude API (only for new questions)
  try {
    const client = new Anthropic();
    const result = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      system: SYSTEM,
      messages: [{ role: "user", content: message }]
    });

    const response = result.content[0].text;

    // Step 3: Cache the new answer and return
    const firstWord = key.split(" ")[0];
    if (firstWord.length > 3) CACHE[firstWord] = response;

    return res.status(200).json({ response, cached: false });

  } catch (err) {
    console.error(err.message);
    return res.status(200).json({
      response: "Hubo un problema con mi conexión. Escríbenos directo a WhatsApp: wa.me/529981533910",
      cached: false
    });
  }
};
