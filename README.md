# API REST de Chistes y Operaciones Matemáticas

## 📥 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio (si aplica)
git clone <url-del-repositorio>
cd ApiRestMicro

# Instalar dependencias
npm install

# Iniciar la aplicación
npm start

# Ejecutar consultas de SQL requeridas por el test
node app/ejecutarConsultas.js
```

---

# 🧪 Tests de la API

Esta API incluye pruebas automatizadas para todos los endpoints de Chistes y Matemática usando **Jest** y **Supertest**. Los tests verifican:

- ✅ Respuestas correctas para casos de éxito.
- ❌ Manejo de errores y parámetros inválidos.
- 🔄 Flujo completo de creación, actualización y eliminación de chistes.

---

## 1️⃣ Tests de Chistes (`chistes.test.js`)

Endpoints cubiertos:

- `GET /chistes` → Devuelve un chiste aleatorio.  
  - Casos: respuesta exitosa con id y texto.  

- `GET /chistes/:type` → Devuelve chistes de tipo Chuck o Dad.  
  - Casos: tipo "Chuck", tipo "Dad", error si se pasa otro type.  

- `POST /chistes` → Crea un nuevo chiste.  
  - Casos: creación exitosa con todos los campos, falla si falta `texto`, `usuario_id` o `tematica_id`.  

- `PUT /chistes/:number` → Actualiza un chiste existente.  
  - Casos: actualización exitosa, falla si el ID no existe, falla si no se envía el campo `texto`.  

- `DELETE /chistes/:number` → Elimina un chiste existente.  
  - Casos: eliminación exitosa, falla si el ID no existe.  

- `GET /chistes/emparejados` → Devuelve un array de chistes emparejados.  
  - Casos: respuesta exitosa con listado de chistes, estadísticas de éxitos y fallos.


Cada test verifica tanto el **status code** como la estructura de la respuesta (`body`) y mensajes de error detallados.

---

## 2️⃣ Tests de Matemática (`math.test.js`)

Endpoints cubiertos:

- `GET /matematica/mcm` → Calcula el Mínimo Común Múltiplo de una lista de números.
  - Casos: lista de varios números, un solo número, 10 números, sin parámetros, o valores no numéricos.
- `GET /matematica/masUno` → Devuelve el número recibido + 1.
  - Casos: número válido, sin parámetro, valor no numérico.

Cada test verifica el **status code**, el cálculo correcto, la estructura de la respuesta, y mensajes de error cuando corresponde.

---

## 3️⃣ Ejecutar Tests

### Ejecutar todos los tests
```bash
npm test

# Solo tests de chistes
npm test -- chistes.test.js

# Solo tests de matemática
npm test -- math.test.js
```

---


# 📘 API Endpoints

### Puedes conseguir la lista completa de endpoints en postman listos para testeo en este [link](https://.postman.co/workspace/My-Workspace~6a487a2b-1163-4583-8b01-74df85b8b0c3/collection/26928387-e66f5b56-1f51-4eb7-8328-575a266dc660?action=share&creator=26928387) 

## servers:
- url: http://localhost:3001

---

# paths:


## /chistes:

```bash
## GET
- url: http://localhost:3001/chistes
- descripcion: Devuelve un chiste aleatorio de la base de datos  
- respuesta: 
  - 200: 
  {
    "id": 1,
    "texto": "humor negro chiste 1 de Manolito",
    "usuario_id": 1,
    "tematica_id": 1
  }

```

---

```bash
## POST
- url: http://localhost:3001/chistes
- descripcion: Guarda un nuevo chiste en la base de datos
- requestBody:
  - required: true
  - content:
      application/json:
        {
            "texto": "ejemplo de chiste 1",
            "usuario_id": 2,
            "tematica_id": 1
        }
- respuesta:
  - 201:
    {
        "id": 43,
        "texto": "ejemplo de chiste 1",
        "usuario_id": 2,
        "tematica_id": 1,
        "mensaje": "Chiste creado exitosamente",
        "timestamp": "2025-11-30T03:42:27.386Z"
    }
```

---

# /chistes/{type}:

```bash
## GET
- url: http://localhost:3001/chistes/{type}
- descripcion: Devuelve un chiste de Chuck Norris o Dad Joke según el parámetro
- parametros:
  - in: path
  - name: type
  - required: true
  - schema:
      type: string
      enum: [Chuck, Dad]
- respuesta:
  - 200: 
    {
        "texto": "Chuck Norris turned my pepsi into coke....I drank it for my own safety",
        "fuente": "Chuck Norris API",
        "id": "AFbHbObUT06qzVkdfKlZ-A"
    }
  - 200:   
    {
        "texto": "Why did the tree go to the dentist? It needed a root canal.",
        "fuente": "Dad Jokes API",
        "id": "AIm3w5hiyd"
    }
  - 400: 
    {
        "error": "Tipo de chiste no válido",
        "tipos_validos": [
            "Chuck",
            "Dad"
        ],
        "detalles": "El tipo 'ejemplo' no está soportado"
    }
```

---

# /chistes/{id}:

```bash
## PUT
- url: http://localhost:3001/chistes/{id}
- descripcion: Actualiza un chiste según su ID
- parametros:
  - in: path
  - name: id
  - required: true
  - schema:
      type: integer
- requestBody:
  - required: true
  - content:
      application/json:
        {
            "texto": "ejemplo de chiste 24"
        }
- respuesta:
  - 200:
    {
        "id": 24,
        "texto": "ejemplo de chiste 24",
        "mensaje": "Chiste actualizado exitosamente",
        "cambios": 1,
        "anterior": "humor amarillo chiste 3 de Isabel",
        "timestamp": "2025-11-30T03:47:31.840Z"
    }
  - 400:
    {
        "error": "Chiste no encontrado",
        "detalles": "No existe un chiste con ID: 50",
        "sugerencia": "Verifique el ID del chiste"
    }
```

---

```bash
## DELETE
- url: http://localhost:3001/chistes/{id}
- descripcion: Elimina un chiste según su ID
- parametros:
  - in: path
  - name: id
  - required: true
  - schema:
      type: integer
- respuesta:
  - 200:
    {
        "mensaje": "Chiste eliminado correctamente",
        "id": 44,
        "cambios": 1
    }
  - 400: 
    {
        "error": "Chiste no encontrado",
        "detalles": "No existe un chiste con ID: 80"
    }
```

---

```bash
## GET
- url: http://localhost:3001/chistes/emparejados
- descripcion: Devuelve 5 chistes Chuck y 5 Dad emparejados creativamente
- respuesta:
  - 200:
    {
        "chistes": [
            {
                "chuck": "Chuck Norris is not as smart as Einstein. It is impossible for Einstein to arrange M&M's in abc order but Chuck Norris can.",
                "dad": "Waking up this morning was an eye-opening experience.",
                "combinado": "Chuck Norris aprobaría esto: Chuck Norris is not as smart as Einstein. It is impossible for Einstein to arrange M&M's in abc order but Chuck Norris can.. Y añadiría: Waking up this morning was an eye-opening experience.",
                "estado": {
                    "chuck": "éxito",
                    "dad": "éxito"
                }
            },
            {
                "chuck": "Chuck Norris eats beef jerky and craps gunpowder. Then, he uses that gunpowder to make a bullet, which he uses to kill a cow and make more beef jerky. Some people refer to this as the \"Circle of Life.\"",
                "dad": "What do vegetarian zombies eat? Grrrrrainnnnnssss.",
                "combinado": "Chuck Norris aprobaría esto: Chuck Norris eats beef jerky and craps gunpowder. Then, he uses that gunpowder to make a bullet, which he uses to kill a cow and make more beef jerky. Some people refer to this as the \"Circle of Life.\". Y añadiría: What do vegetarian zombies eat? Grrrrrainnnnnssss.",
                "estado": {
                    "chuck": "éxito",
                    "dad": "éxito"
                }
            },
            {
                "chuck": "CHUCK NORRIS AND DUX ARE THE ONLY PEOPLE TO EVER SURVIVE THE CHAMBERS GRIP / CHAMBERS LIGHTER PUNCH !!!!!!!!!!!!! OMG",
                "dad": "What is the least spoken language in the world?\r\nSign Language",
                "combinado": "CHUCK NORRIS AND DUX ARE THE ONLY PEOPLE TO EVER SURVIVE THE CHAMBERS GRIP / CHAMBERS LIGHTER PUNCH !!!!!!!!!!!!! OMG. Por cierto, what is the least spoken language in the world?\r\nsign language",
                "estado": {
                    "chuck": "éxito",
                    "dad": "éxito"
                }
            },
            {
                "chuck": "Sarah Palin has hired Chuck Norris to prepare her Alaskan Thankgiving Day dinner because he is the only person alive that can cram a 1,200 pound moose in her oven.",
                "dad": "The urge to sing the Lion King song is just a whim away.",
                "combinado": "Sabías que sarah palin has hired Chuck Norris to prepare her alaskan thankgiving day dinner because he is the only person alive that can cram a 1,200 pound moose in her oven.? Además, the urge to sing the lion king song is just a whim away.",
                "estado": {
                    "chuck": "éxito",
                    "dad": "éxito"
                }
            },
            {
                "chuck": "They once made a Chuck Norris toilet paper, but it wouldn't take shit from anybody.",
                "dad": "what do you call a dog that can do magic tricks? a labracadabrador",
                "combinado": "Chuck Norris aprobaría esto: They once made a Chuck Norris toilet paper, but it wouldn't take shit from anybody.. Y añadiría: what do you call a dog that can do magic tricks? a labracadabrador",
                "estado": {
                    "chuck": "éxito",
                    "dad": "éxito"
                }
            }
        ],
        "estadisticas": {
            "total_chistes": 5,
            "chuck_exitosos": 5,
            "dad_exitosos": 5,
            "chuck_fallidos": 0,
            "dad_fallidos": 0
        },
        "timestamp": "2025-11-30T03:51:28.378Z"
    }
```

---

# /matematica/mcm:

```bash
## GET
- url: http://localhost:3001/matematica/mcm{numbers}
- descripcion: Calcula el MCM de una lista de números enteros
- parametros:
  - in: query
  - name: numbers
  - required: true
  - schema:
      type: string
      example: "4,6,8,10"
- respuesta:
  - 200:
    {
        "numeros": [
            4,
            6,
            8,
            10
        ],
        "minimoComunMultiplo": 120,
        "calculo": "MCM(4, 6, 8, 10) = 120",
        "timestamp": "2025-11-30T03:53:11.511Z",
        "cantidad_numeros": 4
    }
```

---

# /matematica/sumar:

```bash
## GET
- url: http://localhost:3001/matematico/masUno{number}
- descripcion: Devuelve el número recibido + 1
- parametros:
  - in: query
  - name: number
  - required: true
  - schema:
      type: integer
      example: 9
- respuesta:
  - 200:
    {
        "original": 9,
        "resultado": 10,
        "operacion": "9 + 1 = 10",
        "tipos": {
            "entrada": "entero",
            "salida": "entero"
        },
        "precision": {
            "entrada": "9",
            "salida": "10"
        },
        "timestamp": "2025-11-30T03:55:00.662Z",
        "mensaje": "Operación completada exitosamente"
    }
```

