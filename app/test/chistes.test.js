import request from "supertest";
import { server as app } from "../app.js"

describe("CHISTES API", () => {

  let nuevoChisteId = null
  
  // ================================
  // GET /chistes (random de la DB)
  // ================================
  test("GET /chistes → debe devolver un chiste aleatorio", async () => {
    const res = await request(app).get("/chistes");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("texto");
  });

  // ================================
  // GET /chistes/:type (Chuck / Dad)
  // ================================
  test("GET /chistes/Chuck → debe devolver chiste de Chuck Norris", async () => {
    const res = await request(app).get("/chistes/Chuck");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fuente");
    expect(res.body).toHaveProperty("texto");
    expect(res.body).toHaveProperty("id");
  });

  test("GET /chistes/Dad → debe devolver chiste de Dad Joke", async () => {
    const res = await request(app).get("/chistes/Dad");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fuente");
    expect(res.body).toHaveProperty("texto");
    expect(res.body).toHaveProperty("id");
  });

  test("GET /chistes/EJEMPLO → falla (se usa cualquier param distinto a Chuck o Dad)", async () => {
    const res = await request(app).get("/chistes/EJEMPLO");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Tipo de chiste no válido")
    expect(res.body).toHaveProperty("tipos_validos");
    expect(res.body.tipos_validos).toStrictEqual([
        "Chuck",
        "Dad"
    ])
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("El tipo 'EJEMPLO' no está soportado")
  });

  
  // ================================
  // POST /chistes (crear chiste)
  // ================================
  test("POST /chistes → debe crear un chiste", async () => {
    const res = await request(app)
      .post("/chistes")
      .send({ 
        texto: "Este es un chiste de prueba",
        usuario_id: 2,
        tematica_id: 1
       });

    nuevoChisteId = res.body.id
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("texto");
    expect(res.body.texto).toBe("Este es un chiste de prueba");
    expect(res.body).toHaveProperty("usuario_id");
    expect(res.body).toHaveProperty("tematica_id");
    expect(res.body).toHaveProperty("mensaje");
    expect(res.body.mensaje).toBe("Chiste creado exitosamente")
    expect(res.body).toHaveProperty("timestamp");
  });

  test("POST /chistes → falla (body sin texto)", async () => {
    const res = await request(app)
      .post("/chistes")
      .send({ 
        usuario_id: 2,
        tematica_id: 1
       });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Faltan parámetros obligatorios")
    expect(res.body).toHaveProperty("campos_faltantes");
    expect(res.body.campos_faltantes).toStrictEqual(['texto'])
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("Todos los campos son requeridos para crear un chiste");
  });


  test("POST /chistes → falla (body sin usuario_id)", async () => {
    const res = await request(app)
      .post("/chistes")
      .send({ 
        texto: "Este es un chiste de prueba",
        tematica_id: 1
       });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Faltan parámetros obligatorios")
    expect(res.body).toHaveProperty("campos_faltantes");
    expect(res.body.campos_faltantes).toStrictEqual(['usuario_id'])
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("Todos los campos son requeridos para crear un chiste");
  });

  test("POST /chistes → falla (body sin tematica_id)", async () => {
    const res = await request(app)
      .post("/chistes")
      .send({ 
        texto: "Este es un chiste de prueba",
        usuario_id: 2,
       });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Faltan parámetros obligatorios")
    expect(res.body).toHaveProperty("campos_faltantes");
    expect(res.body.campos_faltantes).toStrictEqual(['tematica_id'])
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("Todos los campos son requeridos para crear un chiste");
  });


  // ================================
  // PUT /chistes/:number (update)
  // ================================
  test("PUT /chistes/1 → debe actualizar un chiste", async () => {
    const res = await request(app)
      .put("/chistes/37")
      .send({ texto: "Chiste actualizado por test" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
  });


  test("PUT /chistes/1 → falla (se pasa un id inexistente)", async () => {
    const res = await request(app)
      .put("/chistes/300")
      .send({ texto: "Chiste actualizado por test" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Chiste no encontrado")
    expect(res.body).toHaveProperty("detalles");
    expect(res.body).toHaveProperty("sugerencia");
    expect(res.body.sugerencia).toBe("Verifique el ID del chiste")
  });


  test("PUT /chistes/1 → falla (no se envia texto en body)", async () => {
    const res = await request(app)
      .put("/chistes/37")
      .send({ });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Falta el texto del chiste")
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("El campo 'texto' es obligatorio para actualizar el chiste");
  });

  
  // ================================
  // DELETE /chistes/:number
  // ================================
  test("DELETE /chistes/1 → debe eliminar un chiste (ultimo chiste creado con el test de POST en este mismo archivo)", async () => {
    const res = await request(app).delete(`/chistes/${nuevoChisteId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
  });


  test("DELETE /chistes/1 → falla (se le da un ID que no existe en la DB)", async () => {
    const res = await request(app).delete(`/chistes/${nuevoChisteId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Chiste no encontrado");
    expect(res.body).toHaveProperty("detalles");
  });
  
  // ================================
  // GET /chistes/emparejados
  // ================================
  test("GET /chistes/emparejados → debe devolver un array de chistes emparejados", async () => {
    const res = await request(app).get("/combinados");

    console.log(res.body)
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("chistes");
    expect(Array.isArray(res.body.chistes)).toBe(true);
    expect(res.body).toHaveProperty("estadisticas");
    expect(res.body.estadisticas).toHaveProperty("total_chistes");
    expect(res.body.estadisticas.total_chistes).toBe(5);
    expect(res.body.estadisticas).toHaveProperty("chuck_exitosos");
    expect(res.body.estadisticas.chuck_exitosos).toBe(5);
    expect(res.body.estadisticas).toHaveProperty("dad_exitosos");
    expect(res.body.estadisticas.dad_exitosos).toBe(5);
    expect(res.body.estadisticas).toHaveProperty("chuck_fallidos");
    expect(res.body.estadisticas.chuck_fallidos).toBe(0);
    expect(res.body.estadisticas).toHaveProperty("dad_fallidos");
    expect(res.body.estadisticas.dad_fallidos).toBe(0);
    expect(res.body).toHaveProperty("timestamp");
  });
});
