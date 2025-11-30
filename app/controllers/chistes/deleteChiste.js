import { db } from '../../dbInit.js';

export async function deleteChiste(req, res) {
  // Timeout para la operación de base de datos (10 segundos)
  const timeoutDuration = 10000;
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), timeoutDuration);
  });

  try {
    const { id } = req.params;

    // Validar que el ID esté presente y sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'ID de chiste inválido o no proporcionado' 
      });
    }

    // Ejecutar la operación con timeout
    const dbOperation = db.run('DELETE FROM chistes WHERE id=?', id);
    const result = await Promise.race([dbOperation, timeoutPromise]);

    // Verificar si se eliminó algún registro
    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Chiste no encontrado',
        detalles: `No existe un chiste con ID: ${id}`
      });
    }

    // Respuesta de éxito
    res.json({ 
      mensaje: 'Chiste eliminado correctamente',
      id: parseInt(id),
      cambios: result.changes
    });

  } catch (err) {
    console.error('❌ Error eliminando chiste:', err.message);

    // Manejar diferentes tipos de errores
    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La eliminación tardó demasiado en completarse'
      });
    }

    if (err.message.includes('SQLITE_') || err.message.includes('database')) {
      return res.status(503).json({ 
        error: 'Error de base de datos',
        detalles: 'No se pudo acceder a la base de datos en este momento'
      });
    }

    if (err.message.includes('network') || err.message.includes('ECONN')) {
      return res.status(502).json({ 
        error: 'Error de conexión',
        detalles: 'Problema de conectividad con la base de datos'
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
    });
  }
}