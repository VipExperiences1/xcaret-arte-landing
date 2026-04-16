// API para recibir datos del formulario y enviarlos a Kommo
// Usa la API REST de Kommo para crear leads
// Documentación: https://kommo.com/api/crm/

// Credenciales de Kommo (TEMPORAL - usar variables de entorno en producción)
const KOMMO_ACCOUNT_ID = '15112611';
const KOMMO_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhhMGIyOTIxYTc0ZGIyZmJjMGViMGNiNDJmNDBlOTU1OWY2NDg0OThiMTYzNmQ2OWJjYjVlZjg3MjRiMmY3MDA1ZWRlYmUyYTA3ZmJlNDQ0MiJ9.eyJhdWQiOiJjZGQ5NjVjOS05YzcxLTQ5MTMtOTlkYy05N2UxNTc4Yjc0MWUiLCJqdGkiOiI4YTBiMjkyMWE3NGRiMmZiYzBlYjBjYjQyZjQwZTk1OWY2NDg0OThiMTYzNmQ2OWJjYjVlZjg3MjRiMmY3MDA1ZWRlYmUyYTA3ZmJlNDQ0MiIsImlhdCI6MTc3NjMwOTk2OSwibmJmIjoxNzc2MzA5OTY5LCJleHAiOjE5MDI0NDE2MDAsInN1YiI6IjE1MTEyNjExIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM2MzQxOTI3LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYWNlNWQ0MTYtZGU5ZC00M2JiLWE0YjQtOTc2ODA1YWRiNTZlIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.kzyPT1AWqg_Z5FIbLKhWhy2GYPwnI_CKmkSNpxj4RHe7Opwwaa7nHrKHkNexhq9OHY1CCBv37ZoUXSZwX6wiazJzc2_BmClsnyvAXazqEAJsNt7AqJtagF1vpKqQ_Y2cAk02_695OqDt3VXRbrCZmlFbVvsO69dz4iovvUbPBvZiOI4aWy0BbOlxX_ez5JLUaSySm-lVKF6SRjEeeZ4SBbNMe7uJPLuKvIgRdPUq_iGUnUnJkJ1hxCbQonU6YiMnA17polJBsbA4U9pMCe3tW8RExYsY4dxOs6G8GhDhEOyVvSLXbMJ-oGorxz63DBeRnShU4NOmFc2RfYky8Z-PGQ';

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
              // Construir URL de la API de Kommo - NOTA: usando api-c.kommo.com según el token
            const kommoApiUrl = `https://api-c.kommo.com/api/v4/contacts`;

            // Preparar datos para la API de Kommo en el formato correcto
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

            // Realizar solicitud a la API de Kommo con headers correctos
            const kommoResponse = await fetch(kommoApiUrl, {
                          method: 'POST',
                          headers: {
                                          'Authorization': `Bearer ${KOMMO_API_TOKEN}`,
                                          'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(kontaktData)
            });

            // Obtener respuesta
            const responseData = await kommoResponse.json().catch(() => ({}));

            console.log('Respuesta de Kommo:', kommoResponse.status, responseData);

            // Verificar si fue exitosa
            if (!kommoResponse.ok) {
                          const errorMsg = responseData?.errors?.[0]?.detail || responseData?.error || `Error ${kommoResponse.status}`;
                          console.error('Error de Kommo API:', errorMsg, responseData);
                          throw new Error(`Error de Kommo: ${errorMsg}`);
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
