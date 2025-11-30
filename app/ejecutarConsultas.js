import { db } from './dbInit.js';

export async function ejecutarConsultas() {
  console.log('=== CONSULTA 1: Chistes de Manolito ===');
  const consulta1 = await db.all(`
    SELECT c.texto, t.nombre as tematica, u.nombre as autor
    FROM chistes c
    JOIN usuarios u ON c.usuario_id = u.id
    JOIN tematicas t ON c.tematica_id = t.id
    WHERE u.nombre = 'Manolito'
  `);
  console.log(consulta1);

  console.log('\n=== CONSULTA 2: Chistes de humor negro ===');
  const consulta2 = await db.all(`
    SELECT c.texto, u.nombre as autor, t.nombre as tematica
    FROM chistes c
    JOIN tematicas t ON c.tematica_id = t.id
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE t.nombre = 'humor negro'
  `);
  console.log(consulta2);

  console.log('\n=== CONSULTA 3: Chistes de humor negro por Manolito ===');
  const consulta3 = await db.all(`
    SELECT c.texto, u.nombre as autor, t.nombre as tematica
    FROM chistes c
    JOIN usuarios u ON c.usuario_id = u.id
    JOIN tematicas t ON c.tematica_id = t.id
    WHERE u.nombre = 'Manolito' AND t.nombre = 'humor negro'
  `);
  console.log(consulta3);
}

ejecutarConsultas();