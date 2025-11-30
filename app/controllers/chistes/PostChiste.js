import { db } from '../../dbInit.js';

export async function postChiste(req, res) {
  const dbTimeout = 8000;

  try {
    const { texto, usuario_id, tematica_id } = req.body;

    if (!texto || !usuario_id || !tematica_id) {
      const camposFaltantes = [];
      if (!texto) camposFaltantes.push('texto');
      if (!usuario_id) camposFaltantes.push('usuario_id');
      if (!tematica_id) camposFaltantes.push('tematica_id');

      return res.status(400).json({ 
        error: 'Faltan parámetros obligatorios',
        campos_faltantes: camposFaltantes,
        detalles: 'Todos los campos son requeridos para crear un chiste'
      });
    }

    if (typeof texto !== 'string' || texto.trim().length === 0) {
      return res.status(400).json({
        error: 'Texto inválido',
        detalles: 'El texto debe ser una cadena no vacía',
        longitud_actual: texto ? texto.length : 0
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

    if (isNaN(parseInt(usuario_id)) || parseInt(usuario_id) <= 0) {
      return res.status(400).json({
        error: 'ID de usuario inválido',
        detalles: 'El usuario_id debe ser un número entero positivo',
        valor_recibido: usuario_id
      });
    }

    if (isNaN(parseInt(tematica_id)) || parseInt(tematica_id) <= 0) {
      return res.status(400).json({
        error: 'ID de temática inválido',
        detalles: 'La tematica_id debe ser un número entero positivo',
        valor_recibido: tematica_id
      });
    }

    const usuarioExists = await db.get('SELECT id FROM usuarios WHERE id = ?', parseInt(usuario_id));
    if (!usuarioExists) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        detalles: `No existe un usuario con ID: ${usuario_id}`,
        sugerencia: 'Verifique el ID del usuario'
      });
    }

    const tematicaExists = await db.get('SELECT id FROM tematicas WHERE id = ?', parseInt(tematica_id));
    if (!tematicaExists) {
      return res.status(404).json({
        error: 'Temática no encontrada',
        detalles: `No existe una temática con ID: ${tematica_id}`,
        sugerencia: 'Verifique el ID de la temática'
      });
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La operación de base de datos tardó demasiado')), dbTimeout);
    });

    const dbOperation = db.run(
      'INSERT INTO chistes(texto, usuario_id, tematica_id) VALUES(?,?,?)',
      texto.trim(),
      parseInt(usuario_id),
      parseInt(tematica_id)
    );

    const result = await Promise.race([dbOperation, timeoutPromise]);

    res.status(201).json({ 
      id: result.lastID, 
      texto: texto.trim(),
      usuario_id: parseInt(usuario_id),
      tematica_id: parseInt(tematica_id),
      mensaje: 'Chiste creado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Error en postChiste:', err.message);

    if (err.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'Timeout de la operación',
        detalles: 'La creación del chiste tardó demasiado en completarse',
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

    if (err.message.includes('SQLITE_CONSTRAINT_FOREIGNKEY')) {
      return res.status(400).json({ 
        error: 'Referencia inválida',
        detalles: 'El usuario o temática especificada no existe',
        sugerencia: 'Verifique los IDs proporcionados'
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

    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'No se pudo crear el chiste',
      timestamp: new Date().toISOString()
    });
  }
}