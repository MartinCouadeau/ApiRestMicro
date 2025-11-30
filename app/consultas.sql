-- CONSULTA 1: Todos los chistes creados por "Manolito"
SELECT c.texto, t.nombre as tematica, u.nombre as autor
FROM chistes c
JOIN usuarios u ON c.usuario_id = u.id
JOIN tematicas t ON c.tematica_id = t.id
WHERE u.nombre = 'Manolito';

-- CONSULTA 2: Todos los chistes de la temática "humor negro"
SELECT c.texto, u.nombre as autor, t.nombre as tematica
FROM chistes c
JOIN tematicas t ON c.tematica_id = t.id
JOIN usuarios u ON c.usuario_id = u.id
WHERE t.nombre = 'humor negro';

-- CONSULTA 3: Chistes de "humor negro" creados por "Manolito"
SELECT c.texto, u.nombre as autor, t.nombre as tematica
FROM chistes c
JOIN usuarios u ON c.usuario_id = u.id
JOIN tematicas t ON c.tematica_id = t.id
WHERE u.nombre = 'Manolito' AND t.nombre = 'humor negro';