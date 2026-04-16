// API para recibir datos del formulario y enviarlos a Kommo
// Usa el webhook de Kommo para crear leads
// Documentación: https://kommo.com/api/crm/

// Webhook URL de Kommo
const KOMMO_WEBHOOK_URL = 'https://scheduler.kommo.com/api/v1/external/hooks/crm';

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
                // Preparar datos para el webhook de Kommo
              // El webhook espera un objeto con los datos del contacto
              const webhookPayload = {
                              name: name,
                              email: email,
                              phone: phone,
                              source: 'xcaret-arte-landing'
              };

              console.log('Enviando a Kommo webhook:', JSON.stringify(webhookPayload, null, 2));

              // Realizar solicitud al webhook de Kommo
              const kommoResponse = await fetch(KOMMO_WEBHOOK_URL, {
                              method: 'POST',
                              headers: {
                                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify(webhookPayload)
              });

              // Obtener respuesta
              const responseData = await kommoResponse.json().catch(() => ({}));

              console.log('Respuesta de Kommo:', kommoResponse.status, responseData);

              // Verificar si fue exitosa (2xx status code)
              if (!kommoResponse.ok) {
                              const errorMsg = responseData?.error || `Error ${kommoResponse.status}`;
                              console.error('Error de Kommo:', errorMsg, responseData);
                              throw new Error(`Error de Kommo: ${errorMsg}`);
              }

              // Respuesta exitosa
              return res.status(200).json({
                              success: true,
                              message: 'Lead enviado a Kommo exitosamente',
                                timestamp: new Date().toISOString()
              });

  } catch (error) {
                console.error('Error en submit-lead:', error.message);

              return res.status(500).json({
                              success: false,
                              error: error.message || 'Error interno del servidor'
              });
  }
}
