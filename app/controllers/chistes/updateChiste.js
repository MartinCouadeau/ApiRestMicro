import { db } from '../../dbInit.js';

export async function updateChiste(req, res) {
  // Configuración de timeout
  const dbTimeout = 8000; // 8 segundos para operación de BD

  try {
    const { id } = req.params;
    const { texto } = req.body;

    // Validar ID del chiste
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return res.status(400).json({ 
        error: 'ID de chiste inválido',
        detalles: 'El ID debe ser un número entero positivo',
        valor_recibido: id
      });
    }

    // Validar que el texto esté presente
    if (!texto) {
      return res.status(400).json({ 
        error: 'Falta el texto del chiste',
        detalles: "El campo 'texto' es obligatorio para actualizar el chiste"
      });
    }

    // Validaciones específicas del texto
    if (typeof texto !== 'string') {
      return res.status(400).json({
        error: 'Formato de texto inválido',
        detalles: 'El texto debe ser una cadena de caracteres',
        tipo_recibido: typeof texto
      });
    }

    if (texto.trim().length === 0) {
      return res.status(400).json({
        error: 'Texto vacío',
        detalles: 'El texto no puede estar vacío o contener solo espacios',
        longitud_actual: 0
      });
    }

    if (texto.trim().length > 500) {
      return res.status(400).json({
        error: 'Texto demasiado largo',
        detalles: 'El chiste no puede exceder los 500 caracteres',
        longitud_actual: texto.length,
        maximo_permitido: 500
      });
    }

    // Verificar que el chiste existe antes de actualizar
    const chisteExistente = await db.get('SELECT id, texto FROM chistes WHERE id = ?', parseInt(id));
    if (!chisteExistente) {
      return res.status(404).json({
        error: 'Chiste no encontrado',
        detalles: `No existe un chiste con ID: ${id}`,
        sugerencia: 'Verifique el ID del chiste'
      });
    }

    // Verificar si el texto es diferente al actual
    if (chisteExistente.texto === texto.trim()) {
      return res.status(200).json({
        mensaje: 'El chiste ya tiene el mismo texto',
        id: parseInt(id),
        texto: texto.trim(),
        actualizado: false
      });
    }

    // Preparar timeout para la operación de BD
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La operación de actualización tardó demasiado')), dbTimeout);
    });

    // Ejecutar actualización con timeout
    const dbOperation = db.run(
      'UPDATE chistes SET texto = ? WHERE id = ?', 
      texto.trim(), 
      parseInt(id)
    );

    const result = await Promise.race([dbOperation, timeoutPromise]);

    // Verificar que se actualizó efectivamente
    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Chiste no encontrado durante la actualización',
        detalles: `El chiste con ID: ${id} no pudo ser actualizado`,
        sugerencia: 'Verifique que el chiste aún existe'
      });
    }

    // Respuesta de éxito
    res.json({ 
      id: parseInt(id), 
      texto: texto.trim(),
      mensaje: 'Chiste actualizado exitosamente',
      cambios: result.changes,
      anterior: chisteExistente.texto,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Error en updateChiste:', err.message);

    // Manejar diferentes tipos de errores
    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La actualización del chiste tardó demasiado en completarse',
        sugerencia: 'Intente nuevamente en un momento'
      });
    }

    if (err.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ 
        error: 'Chiste duplicado',
        detalles: 'Ya existe un chiste idéntico en la base de datos',
        sugerencia: 'Modifique el texto del chiste'
      });
    }

    if (err.message.includes('SQLITE_READONLY')) {
      return res.status(503).json({ 
        error: 'Base de datos en modo lectura',
        detalles: 'No se pueden realizar actualizaciones en este momento',
        sugerencia: 'Contacte al administrador del sistema'
      });
    }

    if (err.message.includes('SQLITE_') || err.message.includes('database')) {
      return res.status(503).json({ 
        error: 'Error de base de datos',
        detalles: 'No se pudo completar la operación en la base de datos',
        sugerencia: 'Intente nuevamente más tarde'
      });
    }

    if (err.message.includes('network') || err.message.includes('ECONN')) {
      return res.status(502).json({ 
        error: 'Error de conexión',
        detalles: 'Problema de conectividad con la base de datos',
        sugerencia: 'Verifique la conexión a la base de datos'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'No se pudo actualizar el chiste',
      timestamp: new Date().toISOString()
    });
  }
}