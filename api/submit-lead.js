export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
        }

          const { name, email, phone } = req.body;

            // Validar datos
              if (!name || !email || !phone) {
                  return res.status(400).json({ error: 'Faltan campos requeridos' });
                    }

                      try {
                          // Llamar a la API de Kommo
                              const kommoResponse = await fetch('https://acarlosvibe.kommo.com/api/v4/leads', {
                                    method: 'POST',
                                          headers: {
                                                  'Authorization': `Bearer ${process.env.KOMMO_API_TOKEN}`,
                                                          'Content-Type': 'application/json',
                                                                },
                                                                      body: JSON.stringify({
                                                                              name: name,
                                                                                      custom_fields_values: [
                                                                                                {
                                                                                                            field_id: process.env.KOMMO_EMAIL_FIELD_ID || '1',
                                                                                                                        values: [{ value: email }]
                                                                                                                                  },
                                                                                                                                            {
                                                                                                                                                        field_id: process.env.KOMMO_PHONE_FIELD_ID || '2',
                                                                                                                                                                    values: [{ value: phone }]
                                                                                                                                                                              }
                                                                                                                                                                                      ]
                                                                                                                                                                                            })
                                                                                                                                                                                                });
                                                                                                                                                                                                
                                                                                                                                                                                                    if (!kommoResponse.ok) {
                                                                                                                                                                                                          const errorData = await kommoResponse.text();
                                                                                                                                                                                                                console.error('Error de Kommo:', errorData);
                                                                                                                                                                                                                      throw new Error(`Error: ${kommoResponse.status}`);
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                          
                                                                                                                                                                                                                              const responseData = await kommoResponse.json();
                                                                                                                                                                                                                              
                                                                                                                                                                                                                                  // Respuesta exitosa
                                                                                                                                                                                                                                      res.status(200).json({
                                                                                                                                                                                                                                            success: true,
                                                                                                                                                                                                                                                  message: 'Lead creado exitosamente',
                                                                                                                                                                                                                                                        leadId: responseData._id
                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                              } catch (error) {
                                                                                                                                                                                                                                                                  console.error('Error al crear lead:', error);
                                                                                                                                                                                                                                                                      res.status(500).json({
                                                                                                                                                                                                                                                                            success: false,
                                                                                                                                                                                                                                                                                  error: error.message
                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                        }
