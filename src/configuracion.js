function leerConfiguracion(entorno = process.env) {
  const puertoTexto = entorno.PORT ?? "3000";
  const puerto = Number(puertoTexto);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(
      `PORT inválido: "${puertoTexto}". Debe ser un entero entre 1 y 65535.`,
    );
  }

  const esProduccion = entorno.NODE_ENV === "production";
  const formatoRegistro = esProduccion ? "combined" : "dev";

  return { puerto, formatoRegistro };
}

module.exports = { leerConfiguracion };
