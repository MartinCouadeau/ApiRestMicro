import axios from 'axios';
import { db } from '../../dbInit.js';

export async function getChiste(req, res) {
  // Configuración de timeouts
  const dbTimeout = 8000; // 8 segundos para BD
  const apiTimeout = 10000; // 10 segundos para APIs externas

  try {
    const { type } = req.params;

    // Si no hay tipo, obtener chiste aleatorio de la base de datos
    if (!type) {
      const dbPromise = db.all('SELECT * FROM chistes');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La consulta a la base de datos tardó demasiado')), dbTimeout);
      });

      const chistes = await Promise.race([dbPromise, timeoutPromise]);
      
      if (chistes.length === 0) {
        return res.status(404).json({ 
          mensaje: 'No hay chistes disponibles en la base de datos',
          sugerencia: 'Agrega algunos chistes primero'
        });
      }
      
      const random = chistes[Math.floor(Math.random() * chistes.length)];
      return res.json(random);
    }

    // Validar tipo de chiste
    if (!['Chuck', 'Dad'].includes(type)) {
      return res.status(400).json({ 
        error: 'Tipo de chiste no válido',
        tipos_validos: ['Chuck', 'Dad'],
        detalles: `El tipo '${type}' no está soportado`
      });
    }

    // Chuck Norris API
    if (type === 'Chuck') {
      try {
        const response = await axios.get('https://api.chucknorris.io/jokes/random', {
          timeout: apiTimeout,
          validateStatus: status => status < 500 // Solo rechazar errores 5xx
        });

        // Validar respuesta
        if (!response.data || !response.data.value) {
          throw new Error('Respuesta inválida de Chuck Norris API');
        }

        return res.json({ 
          texto: response.data.value,
          fuente: 'Chuck Norris API',
          id: response.data.id || null
        });

      } catch (apiError) {
        console.error(`❌ Error en Chuck Norris API: ${apiError.message}`);
        
        // Ofrecer fallback a base de datos
        const fallbackChistes = await db.all('SELECT * FROM chistes WHERE tematica_id IN (SELECT id FROM tematicas WHERE nombre LIKE "%negro%" OR nombre LIKE "%chuck%")');
        
        if (fallbackChistes.length > 0) {
          const randomFallback = fallbackChistes[Math.floor(Math.random() * fallbackChistes.length)];
          return res.json({
            ...randomFallback,
            fuente: 'Base de datos (fallback)',
            original_fallido: 'Chuck Norris API'
          });
        }

        throw new Error(`Chuck Norris API no disponible: ${getApiErrorMessage(apiError)}`);
      }
    }

    // Dad Jokes API
    if (type === 'Dad') {
      try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'MiAppChistes/1.0'
          },
          timeout: apiTimeout,
          validateStatus: status => status < 500
        });

        // Validar respuesta
        if (!response.data || !response.data.joke) {
          throw new Error('Respuesta inválida de Dad Jokes API');
        }

        return res.json({ 
          texto: response.data.joke,
          fuente: 'Dad Jokes API',
          id: response.data.id || null
        });

      } catch (apiError) {
        console.error(`❌ Error en Dad Jokes API: ${apiError.message}`);
        
        // Ofrecer fallback a base de datos
        const fallbackChistes = await db.all('SELECT * FROM chistes WHERE tematica_id IN (SELECT id FROM tematicas WHERE nombre LIKE "%amarillo%" OR nombre LIKE "%dad%")');
        
        if (fallbackChistes.length > 0) {
          const randomFallback = fallbackChistes[Math.floor(Math.random() * fallbackChistes.length)];
          return res.json({
            ...randomFallback,
            fuente: 'Base de datos (fallback)',
            original_fallido: 'Dad Jokes API'
          });
        }

        throw new Error(`Dad Jokes API no disponible: ${getApiErrorMessage(apiError)}`);
      }
    }

  } catch (err) {
    console.error('💥 Error en getChiste:', err.message);

    // Manejar diferentes tipos de errores
    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La solicitud tardó demasiado en completarse',
        sugerencia: 'Intente nuevamente en un momento'
      });
    }

    if (err.message.includes('API no disponible')) {
      return res.status(502).json({ 
        error: 'Servicio externo no disponible',
        detalles: err.message.replace('API no disponible: ', ''),
        sugerencia: 'Intente con un chiste de la base de datos local'
      });
    }

    if (err.message.includes('SQLITE_') || err.message.includes('database')) {
      return res.status(503).json({ 
        error: 'Error de base de datos',
        detalles: 'No se pudo acceder a la base de datos local',
        sugerencia: 'Verifique la conexión a la base de datos'
      });
    }

    if (err.message.includes('network') || err.message.includes('ECONN') || err.message.includes('ENOTFOUND')) {
      return res.status(502).json({ 
        error: 'Error de conexión',
        detalles: 'Problema de conectividad de red',
        sugerencia: 'Verifique su conexión a internet'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador',
      timestamp: new Date().toISOString()
    });
  }
}

// Función auxiliar para mensajes de error de API
function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Timeout - La API tardó demasiado en responder';
    }
    if (error.response) {
      return `Error HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    if (error.request) {
      return 'Error de conexión - No se pudo contactar el servidor';
    }
  }
  return error.message || 'Error desconocido en la API';
}