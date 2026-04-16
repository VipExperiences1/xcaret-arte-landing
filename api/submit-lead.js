// API para recibir datos del formulario y enviarlos a Kommo
// Usa la API REST de Kommo para crear leads
// Documentación: https://kommo.com/api/crm/

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
            // Obtener el token API y account ID desde variables de entorno
          const apiToken = process.env.KOMMO_API_TOKEN;
            const accountId = process.env.KOMMO_ACCOUNT_ID;

          if (!apiToken || !accountId) {
                      throw new Error('Credenciales de Kommo no configuradas (KOMMO_API_TOKEN, KOMMO_ACCOUNT_ID)');
          }

          // Construir URL de la API de Kommo
          const kommoApiUrl = `https://${accountId}.kommo.com/api/v4/contacts`;

          // Preparar datos para la API de Kommo
          // https://kommo.com/api/crm/#create-contacts
          const kontaktData = {
                      add: [
                            {
                                            name: name,
                                            custom_fields_values: [
                                                  {
                                                                      field_id: 1, // Email field ID
                                                                      values: [
                                                                            {
                                                                                                    value: email
                                                                            }
                                                                                          ]
                                                  },
                                                  {
                      field_id: 2, // Teléfono field ID
                      values: [
                            {
                                                    value: phone
                            }
                                          ]
                                                  }
                                                            ]
                            }
                                  ]
          };

          console.log('Enviando a Kommo API:', JSON.stringify(kontaktData, null, 2));

          // Realizar solicitud a la API de Kommo
          const kommoResponse = await fetch(kommoApiUrl, {
                      method: 'POST',
                      headers: {
                                    'Authorization': `Bearer ${apiToken}`,
                                    'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(kontaktData)
          });

          // Obtener respuesta
          const responseData = await kommoResponse.json().catch(() => ({}));

          console.log('Respuesta de Kommo:', kommoResponse.status, responseData);

          // Verificar si fue exitosa
          if (!kommoResponse.ok) {
                      const errorMsg = responseData?.errors?.[0]?.detail || responseData?.error || 'Error desconocido';
                      console.error('Error de Kommo API:', errorMsg);
                      throw new Error(`Error ${kommoResponse.status} de Kommo: ${errorMsg}`);
          }

          // Respuesta exitosa
          return res.status(200).json({
                      success: true,
                      message: 'Lead creado en Kommo exitosamente',
                      timestamp: new Date().toISOString(),
                      kontaktId: responseData?._embedded?.contacts?.[0]?.id || null
          });

  } catch (error) {
            console.error('Error en submit-lead:', error.message);

          return res.status(500).json({
                      success: false,
                      error: error.message || 'Error interno del servidor'
          });
  }
}
