// tests/matematica.test.js
import request from "supertest";
import { server as app } from "../app.js";

describe("MATEMÁTICA API", () => {

  // ================================
  // GET /matematica/mcm
  // ================================
  test("GET /matematica/mcm → debe calcular el MCM de una lista de números", async () => {
    const res = await request(app).get("/matematica/mcm?numbers=4,6,8");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("numeros");
    expect(res.body.numeros).toStrictEqual([ 4, 6, 8 ]);
    expect(res.body).toHaveProperty("minimoComunMultiplo");
    expect(res.body.minimoComunMultiplo).toBe(24);
    expect(res.body).toHaveProperty("calculo");
    expect(res.body.calculo).toBe("MCM(4, 6, 8) = 24");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("cantidad_numeros");
    expect(res.body.cantidad_numeros).toBe(3);
  });

  test("GET /matematica/mcm → debe calcular el MCM de un solo numero", async () => {
    const res = await request(app).get("/matematica/mcm?numbers=4");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("numeros");
    expect(res.body.numeros).toStrictEqual([ 4 ]);
    expect(res.body).toHaveProperty("minimoComunMultiplo");
    expect(res.body.minimoComunMultiplo).toBe(4);
    expect(res.body).toHaveProperty("calculo");
    expect(res.body.calculo).toBe("MCM(4) = 4");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("cantidad_numeros");
    expect(res.body.cantidad_numeros).toBe(1);
  });


  test("GET /matematica/mcm → debe calcular el MCM de una lista de 10 numeros", async () => {
    const res = await request(app).get("/matematica/mcm?numbers=4,5,8,10,2,3,17,1,13,9");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("numeros");
    expect(res.body.numeros).toStrictEqual([
        4,
        5,
        8,
        10,
        2,
        3,
        17,
        1,
        13,
        9
    ]);
    expect(res.body).toHaveProperty("minimoComunMultiplo");
    expect(res.body.minimoComunMultiplo).toBe(79560);
    expect(res.body).toHaveProperty("calculo");
    expect(res.body.calculo).toBe("MCM(4, 5, 8, 10, 2, 3, 17, 1, 13, 9) = 79560");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("cantidad_numeros");
    expect(res.body.cantidad_numeros).toBe(10);
  });
 
  test("GET /matematica/mcm → falla (no se envía el parámetro 'numbers')", async () => {
    const res = await request(app)
      .get("/matematica/mcm");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Parámetro requerido faltante");
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("El parámetro 'numbers' es requerido");
    expect(res.body).toHaveProperty("ejemplo");
    expect(res.body.ejemplo).toBe('/api/mcm?numbers=4,6,8');
  });

  test("GET /matematica/mcm → falla (se envían valores no numéricos)", async () => {
    const res = await request(app)
      .get("/matematica/mcm")
      .query({ numbers: "a,b,c" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Datos de entrada inválidos");
    expect(res.body).toHaveProperty("detalles");
  });

  
  // ================================
  // GET /matematica/sumar
  // ================================
  test("GET /matematica/sumar → debe devolver el número recibido + 1", async () => {
    const res = await request(app)
      .get("/matematica/masUno?number=9")

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("original");
    expect(res.body.original).toBe(9)
    expect(res.body).toHaveProperty("resultado");
    expect(res.body.resultado).toBe(10)
    expect(res.body).toHaveProperty("operacion");
    expect(res.body.operacion).toBe("9 + 1 = 10")
    expect(res.body).toHaveProperty("tipos");
    expect(res.body.tipos).toStrictEqual({ entrada: 'entero', salida: 'entero' })
    expect(res.body).toHaveProperty("precision");
    expect(res.body.precision).toStrictEqual({ entrada: '9', salida: '10' })
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("mensaje");
    expect(res.body.mensaje).toBe("Operación completada exitosamente")
  });


  test("GET /matematica/sumar → falla si no se envía el parámetro 'number'", async () => {
    const res = await request(app)
      .get("/matematica/masUno");

    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Parámetro requerido faltante");
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("El parámetro 'number' es requerido");
    expect(res.body).toHaveProperty("ejemplo");
    expect(res.body.ejemplo).toBe("/api/masUno?number=5");
  });

  
  test("GET /matematica/sumar → falla si se envía un valor no numérico", async () => {
    const res = await request(app)
      .get("/matematica/masUno")
      .query({ number: "abc" });

    console.log(res.body)
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Valor de entrada inválido");
    expect(res.body).toHaveProperty("detalles");
    expect(res.body.detalles).toBe("'abc' no es un número válido");
    expect(res.body).toHaveProperty("sugerencia");
    expect(res.body.sugerencia).toBe("Proporcione un número entero valido");
    expect(res.body).toHaveProperty("rango_seguro");
  });

});
