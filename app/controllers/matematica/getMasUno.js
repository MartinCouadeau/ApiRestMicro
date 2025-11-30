export async function getMasUno(req, res) {
  // Configuración de timeout (aunque la operación es simple)
  const calculationTimeout = 3000; // 3 segundos por seguridad

  try {
    const { number } = req.query;

    // Validar que el parámetro esté presente
    if (!number) {
      return res.status(400).json({ 
        error: 'Parámetro requerido faltante',
        detalles: "El parámetro 'number' es requerido",
        ejemplo: '/api/masUno?number=5'
      });
    }

    // Validar que el parámetro sea una cadena
    if (typeof number !== 'string') {
      return res.status(400).json({
        error: 'Formato de parámetro inválido',
        detalles: "El parámetro 'number' debe ser una cadena de texto",
        tipo_recibido: typeof number,
        ejemplo: '/api/masUno?number=5'
      });
    }

    // Preparar timeout (aunque la operación es rápida)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), calculationTimeout);
    });

    // Ejecutar procesamiento con timeout
    const processingPromise = (async () => {
      const numeroStr = number.trim();

      // Validar que no esté vacío después del trim
      if (numeroStr === '') {
        throw new Error("El parámetro 'number' no puede estar vacío");
      }

      // Validar que sea un número válido
      const numero = parseFloat(numeroStr);
      if (isNaN(numero)) {
        throw new Error(`'${number}' no es un número válido`);
      }

      // Validar que sea un número finito
      if (!Number.isFinite(numero)) {
        throw new Error('El número debe ser finito (no Infinity o NaN)');
      }

      // Validar rango seguro para operaciones
      if (numero > Number.MAX_SAFE_INTEGER || numero < Number.MIN_SAFE_INTEGER) {
        throw new Error(`Número fuera del rango seguro. Debe estar entre ${Number.MIN_SAFE_INTEGER} y ${Number.MAX_SAFE_INTEGER}`);
      }

      // Realizar la operación
      const resultado = numero + 1;

      // Validar que el resultado sea seguro
      if (!Number.isFinite(resultado)) {
        throw new Error('El resultado de la operación no es un número finito');
      }

      // Determinar el tipo de número
      const tipoNumero = Number.isInteger(numero) ? 'entero' : 'decimal';
      const tipoResultado = Number.isInteger(resultado) ? 'entero' : 'decimal';

      return {
        original: numero,
        resultado: resultado,
        operacion: `${numero} + 1 = ${resultado}`,
        tipos: {
          entrada: tipoNumero,
          salida: tipoResultado
        },
        precision: {
          entrada: numero.toString(),
          salida: resultado.toString()
        }
      };
    })();

    const resultado = await Promise.race([processingPromise, timeoutPromise]);

    // Respuesta de éxito
    res.json({
      ...resultado,
      timestamp: new Date().toISOString(),
      mensaje: 'Operación completada exitosamente'
    });

  } catch (err) {
    console.error('❌ Error en getMasUno:', err.message);

    // Manejar diferentes tipos de errores
    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La operación matemática tardó demasiado en completarse',
        sugerencia: 'Intente nuevamente con un número más pequeño'
      });
    }

    if (err.message.includes('no es un número válido') || 
        err.message.includes('no puede estar vacío') ||
        err.message.includes('debe ser finito') ||
        err.message.includes('fuera del rango seguro') ||
        err.message.includes('no es un número finito')) {
      return res.status(400).json({ 
        error: 'Valor de entrada inválido',
        detalles: err.message,
        sugerencia: 'Proporcione un número entero valido',
        rango_seguro: `${Number.MIN_SAFE_INTEGER} a ${Number.MAX_SAFE_INTEGER}`
      });
    }

    if (err.message.includes('Formato de parámetro inválido') || 
        err.message.includes('Parámetro requerido faltante')) {
      return res.status(400).json({ 
        error: err.message,
        detalles: 'El parámetro debe ser una cadena de texto que represente un número',
        ejemplo: '/api/masUno?number=5'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'No se pudo realizar la operación matemática',
      timestamp: new Date().toISOString(),
      sugerencia: 'Contacte al administrador si el problema persiste'
    });
  }
}