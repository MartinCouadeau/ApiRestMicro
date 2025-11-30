import { initDB } from './db.js';

export const db = await initDB();

export async function populateDB() {
  const usuarios = ['Manolito', 'Pepe', 'Isabel', 'Pedro'];
  const tematicas = ['humor negro', 'humor amarillo', 'chistes verdes'];

  for (let nombre of usuarios) {
    const exists = await db.get('SELECT id FROM usuarios WHERE nombre = ?', nombre);
    if (!exists) await db.run('INSERT INTO usuarios(nombre) VALUES(?)', nombre);
  }

  for (let nombre of tematicas) {
    const exists = await db.get('SELECT id FROM tematicas WHERE nombre = ?', nombre);
    if (!exists) await db.run('INSERT INTO tematicas(nombre) VALUES(?)', nombre);
  }

  for (let usuario of usuarios) {
    const u = await db.get('SELECT id FROM usuarios WHERE nombre = ?', usuario);
    for (let tematica of tematicas) {
      const t = await db.get('SELECT id FROM tematicas WHERE nombre = ?', tematica);
      const count = await db.get('SELECT COUNT(*) as c FROM chistes WHERE usuario_id=? AND tematica_id=?', u.id, t.id);
      if (count.c === 0) {
        for (let i = 1; i <= 3; i++) {
          await db.run('INSERT INTO chistes(texto, usuario_id, tematica_id) VALUES(?,?,?)', `${tematica} chiste ${i} de ${usuario}`, u.id, t.id);
        }
      }
    }
  }
}
