import axios from 'axios';

export async function chistesCombinados(req, res) {
  // Configuración de timeouts
  const apiTimeout = 10000; // 10 segundos para APIs externas
  const totalTimeout = 15000; // 15 segundos máximo para toda la operación

  try {
    console.log('🔄 Iniciando obtención de chistes combinados...');

    // Timeout global para toda la operación
    const globalTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La operación completa tardó demasiado')), totalTimeout);
    });

    // Lanzar peticiones en paralelo con timeout global
    const jokesPromise = Promise.all([
      getChuckNorrisJokes(5, apiTimeout),
      getDadJokes(5, apiTimeout)
    ]);

    const [chuckJokes, dadJokes] = await Promise.race([jokesPromise, globalTimeoutPromise]);

    console.log('✅ Chistes obtenidos exitosamente');
    console.log(`📊 Chuck Norris: ${chuckJokes.length} chistes, Dad Jokes: ${dadJokes.length} chistes`);

    // Validar que tenemos al menos algunos chistes
    const chuckJokesValidos = chuckJokes.filter(joke => !joke.includes('no disponible'));
    const dadJokesValidos = dadJokes.filter(joke => !joke.includes('no disponible'));

    if (chuckJokesValidos.length === 0 && dadJokesValidos.length === 0) {
      return res.status(503).json({
        error: 'Servicios no disponibles',
        detalles: 'No se pudieron obtener chistes de ninguna API externa',
        sugerencia: 'Intente nuevamente más tarde'
      });
    }

    // Emparejar y combinar los resultados
    const combinedJokes = chuckJokes.map((chuckJoke, index) => {
      const dadJoke = dadJokes[index] || 'Chiste no disponible';
      
      return {
        chuck: chuckJoke,
        dad: dadJoke,
        combinado: combineJokeText(chuckJoke, dadJoke),
        estado: {
          chuck: chuckJoke.includes('no disponible') ? 'fallback' : 'éxito',
          dad: dadJoke.includes('no disponible') ? 'fallback' : 'éxito'
        }
      };
    });

    // Estadísticas de la operación
    const estadisticas = {
      total_chistes: combinedJokes.length,
      chuck_exitosos: chuckJokesValidos.length,
      dad_exitosos: dadJokesValidos.length,
      chuck_fallidos: chuckJokes.length - chuckJokesValidos.length,
      dad_fallidos: dadJokes.length - dadJokesValidos.length
    };

    console.log(`📈 Estadísticas:`, estadisticas);

    return res.json({
      chistes: combinedJokes,
      estadisticas,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error combinando chistes:', error.message);

    // Manejar diferentes tipos de errores
    if (error.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La obtención de chistes combinados tardó demasiado',
        sugerencia: 'Intente con menos chistes o más tarde'
      });
    }

    if (error.message.includes('network') || error.message.includes('ECONN') || error.message.includes('ENOTFOUND')) {
      return res.status(502).json({ 
        error: 'Error de conectividad',
        detalles: 'Problema de conexión a internet',
        sugerencia: 'Verifique su conexión de red'
      });
    }

    if (error.message.includes('servicio') || error.message.includes('API')) {
      return res.status(503).json({ 
        error: 'Servicios externos no disponibles',
        detalles: error.message,
        sugerencia: 'Los servicios de chistes pueden estar temporalmente fuera de línea'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? error.message : 'No se pudieron obtener los chistes combinados',
      timestamp: new Date().toISOString()
    });
  }
}

async function getChuckNorrisJokes(count, timeout) {
  const promises = Array.from({ length: count }, (_, index) =>
    axios.get('https://api.chucknorris.io/jokes/random', { 
      timeout,
      validateStatus: (status) => status < 500 // No rechazar errores 4xx
    })
      .then(response => {
        // Validar estructura de respuesta
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Estructura de respuesta inválida de Chuck Norris API');
        }
        
        if (!response.data.value || typeof response.data.value !== 'string') {
          throw new Error('Texto de chiste inválido de Chuck Norris API');
        }

        return response.data.value;
      })
      .catch(error => {
        const errorMsg = getApiErrorMessage(error);
        console.error(`❌ Error en chiste Chuck Norris ${index + 1}:`, errorMsg);
        return `Chiste Chuck Norris ${index + 1} no disponible - ${errorMsg}`;
      })
  );

  return Promise.all(promises);
}

async function getDadJokes(count, timeout) {
  const promises = Array.from({ length: count }, (_, index) =>
    axios.get('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MiAppChistes/1.0 (https://github.com/tu-usuario)'
      },
      timeout,
      validateStatus: (status) => status < 500
    })
      .then(response => {
        // Validar estructura de respuesta
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Estructura de respuesta inválida de Dad Jokes API');
        }
        
        if (!response.data.joke || typeof response.data.joke !== 'string') {
          throw new Error('Texto de chiste inválido de Dad Jokes API');
        }

        return response.data.joke;
      })
      .catch(error => {
        const errorMsg = getApiErrorMessage(error);
        console.error(`❌ Error en Dad Joke ${index + 1}:`, errorMsg);
        return `Dad Joke ${index + 1} no disponible - ${errorMsg}`;
      })
  );

  return Promise.all(promises);
}

function combineJokeText(chuckJoke, dadJoke) {
  // Si ambos chistes están disponibles, combinarlos creativamente
  if (!chuckJoke.includes('no disponible') && !dadJoke.includes('no disponible')) {
    const strategies = [
      () => `Mientras ${chuckJoke.toLowerCase().replace('chuck norris', 'él')}, también ${dadJoke.toLowerCase()}`,
      () => `${chuckJoke}. Por cierto, ${dadJoke.toLowerCase()}`,
      () => `Sabías que ${chuckJoke.toLowerCase().replace('chuck norris', 'Chuck Norris')}? Además, ${dadJoke.toLowerCase()}`,
      () => `${chuckJoke}. En un universo paralelo: ${dadJoke}`,
      () => `Chuck Norris aprobaría esto: ${chuckJoke}. Y añadiría: ${dadJoke}`
    ];

    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    return randomStrategy();
  }

  // Si solo uno está disponible, devolver ese con contexto
  if (!chuckJoke.includes('no disponible')) {
    return `${chuckJoke} (Chuck Norris manda saludos)`;
  }

  if (!dadJoke.includes('no disponible')) {
    return `${dadJoke} - ¡Un clásico de papá!`;
  }

  // Si ninguno está disponible
  return 'Lamentablemente, los servicios de chistes no están disponibles en este momento. ¡Intente nuevamente más tarde!';
}

function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Timeout - La API tardó demasiado en responder';
    }
    if (error.response) {
      return `Error HTTP ${error.response.status}: ${error.response.statusText || 'Error en el servidor remoto'}`;
    }
    if (error.request) {
      return 'Error de conexión - No se pudo contactar el servidor';
    }
  }
  
  return error.message || 'Error desconocido en la API';
}