// API para recibir datos del formulario y enviarlos a Kommo
// Documentación: https://kommo.com/api/

export default async function handler(req, res) {
      // Solo aceptar POST
  if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, phone } = req.body;

  // Validar que los datos existan
  if (!name || !email || !phone) {
          return res.status(400).json({
                    success: false,
                    error: 'Faltan campos: nombre, email o teléfono'
          });
  }

  try {
          // IMPORTANTE: Configura estas variables en Vercel Settings
        // Environment Variables: KOMMO_WEBHOOK_URL y KOMMO_ACCOUNT_ID
        const webhookUrl = process.env.KOMMO_WEBHOOK_URL;

        if (!webhookUrl) {
                  throw new Error('KOMMO_WEBHOOK_URL no configurada');
        }

        // El webhook de Kommo espera un objeto con estructura específica
        // Crear datos en el formato que Kommo espera para crear leads
        const kommoPayload = {
                  name: name,
                  // Usar custom_fields_values para campos adicionales
                  custom_fields_values: [
                      {
                                    field_id: 1, // Email (field_id 1 es estándar)
                                    values: [{ value: email }]
                      },
                      {
                                    field_id: 2, // Teléfono (field_id 2 es estándar)
                                    values: [{ value: phone }]
                      }
                            ],
                  // Campo custom para rastrear el origen
                  source_data: {
                              utm_source: 'xcaret-arte-landing',
                              platform: 'landing-page'
                  }
        };

        // Log para debugging (optional)
        console.log('Enviando a Kommo:', JSON.stringify(kommoPayload, null, 2));

        // Enviar a Kommo mediante webhook
        const kommoResponse = await fetch(webhookUrl, {
                  method: 'POST',
                  headers: {
                              'Content-Type': 'application/json',
                              'Accept': 'application/json'
                  },
                  body: JSON.stringify(kommoPayload)
        });

        // Obtener respuesta de Kommo
        const responseData = await kommoResponse.json().catch(() => ({}));

        // Log de respuesta (optional)
        console.log('Respuesta de Kommo:', kommoResponse.status, responseData);

        // Verificar si fue exitosa
        if (!kommoResponse.ok) {
                  const errorMsg = responseData?.error || responseData?.message || 'Error desconocido de Kommo';
                  console.error('Error de Kommo:', errorMsg);
                  throw new Error(`Error ${kommoResponse.status} de Kommo: ${errorMsg}`);
        }

        // Respuesta exitosa
        return res.status(200).json({
                  success: true,
                  message: 'Lead enviado a Kommo exitosamente',
                  timestamp: new Date().toISOString(),
                  leadId: responseData?.id || null
        });

  } catch (error) {
          console.error('Error en submit-lead:', error.message);

        return res.status(500).json({
                  success: false,
                  error: error.message || 'Error interno del servidor'
        });
  }
}
