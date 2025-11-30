export async function getComunMultiplo(req, res) {
  // Configuración de timeout para cálculos intensivos
  const calculationTimeout = 5000; // 5 segundos para cálculos

  try {
    const { numbers } = req.query;

    // Validar que el parámetro esté presente
    if (!numbers) {
      return res.status(400).json({ 
        error: 'Parámetro requerido faltante',
        detalles: "El parámetro 'numbers' es requerido",
        ejemplo: '/api/mcm?numbers=4,6,8'
      });
    }

    // Validar que el parámetro sea una cadena
    if (typeof numbers !== 'string') {
      return res.status(400).json({
        error: 'Formato de parámetro inválido',
        detalles: "El parámetro 'numbers' debe ser una cadena de texto",
        tipo_recibido: typeof numbers
      });
    }

    // Preparar timeout para cálculos intensivos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: El cálculo del MCM tardó demasiado')), calculationTimeout);
    });

    // Ejecutar procesamiento con timeout
    const processingPromise = (async () => {
      // Convertir y validar números
      const numerosArray = numbers.split(',').map((num, index) => {
        const numStr = num.trim();
        
        // Validar que no esté vacío
        if (numStr === '') {
          throw new Error(`Elemento vacío en la posición ${index + 1}`);
        }

        // Validar que sea un número válido
        const numero = parseInt(numStr, 10);
        if (isNaN(numero)) {
          throw new Error(`"${numStr}" no es un número válido en la posición ${index + 1}`);
        }

        // Validar rango del número
        if (numero <= 0) {
          throw new Error(`Número no positivo: "${numStr}" en la posición ${index + 1}. Todos los números deben ser enteros positivos`);
        }

        if (numero > Number.MAX_SAFE_INTEGER) {
          throw new Error(`Número demasiado grande: "${numStr}" en la posición ${index + 1}. El máximo permitido es ${Number.MAX_SAFE_INTEGER}`);
        }

        return numero;
      });

      // Validar cantidad de números
      if (numerosArray.length === 0) {
        throw new Error('Debe proporcionar al menos un número');
      }

      if (numerosArray.length > 20) {
        throw new Error('Demasiados números. El máximo permitido es 20');
      }

      // Calcular MCM
      const mcm = calcularMCMArray(numerosArray);

      // Validar que el resultado no sea demasiado grande
      if (!Number.isSafeInteger(mcm)) {
        throw new Error('El mínimo común múltiplo calculado es demasiado grande para ser representado con precisión');
      }

      return {
        numeros: numerosArray,
        minimoComunMultiplo: mcm,
        calculo: `MCM(${numerosArray.join(', ')}) = ${mcm}`
      };
    })();

    const resultado = await Promise.race([processingPromise, timeoutPromise]);

    // Respuesta de éxito
    res.json({
      ...resultado,
      timestamp: new Date().toISOString(),
      cantidad_numeros: resultado.numeros.length
    });

  } catch (err) {
    console.error('❌ Error en getComunMultiplo:', err.message);

    // Manejar diferentes tipos de errores
    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout del cálculo',
        detalles: 'El cálculo del mínimo común múltiplo tardó demasiado',
        sugerencia: 'Intente con menos números o números más pequeños'
      });
    }

    if (err.message.includes('no es un número válido') || 
        err.message.includes('Elemento vacío') ||
        err.message.includes('Número no positivo') ||
        err.message.includes('Demasiados números') ||
        err.message.includes('Número demasiado grande') ||
        err.message.includes('muy grande para ser representado')) {
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos',
        detalles: err.message,
        sugerencia: 'Verifique que todos los elementos sean números enteros positivos válidos'
      });
    }

    if (err.message.includes('Formato de parámetro inválido') || 
        err.message.includes('Parámetro requerido faltante')) {
      return res.status(400).json({ 
        error: err.message,
        detalles: 'El parámetro debe ser una cadena de números separados por comas',
        ejemplo: '/api/mcm?numbers=4,6,8'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'No se pudo calcular el mínimo común múltiplo',
      timestamp: new Date().toISOString()
    });
  }
}

function calcularMCD(a, b) {
  // Usar el algoritmo de Euclides
  let num1 = Math.abs(a);
  let num2 = Math.abs(b);
  
  while (num2 !== 0) {
    const temp = num2;
    num2 = num1 % num2;
    num1 = temp;
  }
  
  return num1;
}

function calcularMCM(a, b) {
  if (a === 0 || b === 0) return 0;
  
  // Usar la relación: MCM(a, b) = (a * b) / MCD(a, b)
  const mcd = calcularMCD(a, b);
  const mcm = (a * b) / mcd;
  
  // Verificar overflow
  if (!Number.isSafeInteger(mcm)) {
    throw new Error('El cálculo del MCM resultó en un número demasiado grande');
  }
  
  return mcm;
}

function calcularMCMArray(numeros) {
  if (numeros.length === 0) return 0;
  if (numeros.length === 1) return numeros[0];
  
  let mcm = numeros[0];
  
  for (let i = 1; i < numeros.length; i++) {
    mcm = calcularMCM(mcm, numeros[i]);
  }
  
  return mcm;
}