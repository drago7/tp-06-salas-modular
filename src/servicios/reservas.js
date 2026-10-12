function crearServicioReservas(reservasIniciales) {
  const reservas = [...reservasIniciales];

  function listar() {
    return [...reservas];
  }

  function contar() {
    return reservas.length;
  }

  function obtenerPorId(id) {
    return reservas.find((reserva) => reserva.id === id) ?? null;
  }

  function crear(datosValidados) {
    const ultimoId = reservas.reduce(
      (mayorId, reserva) => Math.max(mayorId, reserva.id),
      0,
    );
    const nueva = { id: ultimoId + 1, ...datosValidados };
    reservas.push(nueva);
    return nueva;
  }

  return { listar, contar, obtenerPorId, crear };
}

module.exports = { crearServicioReservas };
