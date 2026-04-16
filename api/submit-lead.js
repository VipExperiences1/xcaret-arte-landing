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
      // Environment Variables: KOMMO_WEBHOOK_URL
      const webhookUrl = process.env.KOMMO_WEBHOOK_URL;

      if (!webhookUrl) {
              throw new Error('KOMMO_WEBHOOK_URL no configurada');
      }

      // Preparar datos para Kommo
      const kommoData = {
              // Datos del contacto
              name: name,
              custom_fields_values: [
                {
                            field_id: parseInt(process.env.KOMMO_EMAIL_FIELD_ID || '1'),
                            values: [{ value: email }]
                },
                {
                            field_id: parseInt(process.env.KOMMO_PHONE_FIELD_ID || '2'),
                            values: [{ value: phone }]
                }
                      ],
              source: 'xcaret-arte-landing'
      };

      // Enviar a Kommo mediante webhook
      const kommoResponse = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                        'Content-Type': 'application/json'
              },
              body: JSON.stringify(kommoData)
      });

      // Verificar respuesta
      if (!kommoResponse.ok) {
              const errorText = await kommoResponse.text();
              console.error('Error de Kommo:', errorText);
              throw new Error(`Error ${kommoResponse.status} de Kommo`);
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
