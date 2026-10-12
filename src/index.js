const { leerConfiguracion } = require("./configuracion");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");

const reservasIniciales = [
  {
    id: 1,
    estudiante: "Lucía Fernández",
    email: "lucia.fernandez@ejemplo.com",
    sala: "Sala Norte",
    fecha: "2026-09-29",
    turno: "Mañana",
    personas: 3,
  },
  {
    id: 2,
    estudiante: "Martín Gómez",
    email: "martin.gomez@ejemplo.com",
    sala: "Sala Sur",
    fecha: "2026-09-29",
    turno: "Tarde",
    personas: 2,
  },
  {
    id: 3,
    estudiante: "Ayelén Torres",
    email: "ayelen.torres@ejemplo.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-30",
    turno: "Noche",
    personas: 5,
  },
  {
    id: 4,
    estudiante: "Bruno Ríos",
    email: "bruno.rios@ejemplo.com",
    sala: "Sala Norte",
    fecha: "2026-10-01",
    turno: "Tarde",
    personas: 1,
  },
];

const { puerto, formatoRegistro } = leerConfiguracion();
const servicioReservas = crearServicioReservas(reservasIniciales);
const app = crearApp({ servicioReservas, formatoRegistro });

app.listen(puerto, () => {
  console.log(`Aplicación disponible en http://localhost:${puerto}`);
});
