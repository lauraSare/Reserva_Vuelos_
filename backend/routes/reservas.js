// Rutas de Reservas — ABCC completo
// Seguridad: verificarSesion protege todas las rutas
const express = require("express");
const router = express.Router();
const {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva,
  eliminarReserva,
} = require("../controllers/reservaController");
const { verificarSesion } = require("../middlewares/auth");

// GET /api/reservas — obtener todas las reservas
router.get("/", verificarSesion, obtenerReservas);

// GET /api/reservas/:id — obtener una reserva por ID
router.get("/:id", verificarSesion, obtenerReservaPorId);

// POST /api/reservas — crear una reserva
router.post("/", verificarSesion, crearReserva);

// PUT /api/reservas/:id — actualizar una reserva
router.put("/:id", verificarSesion, actualizarReserva);

// PATCH /api/reservas/:id/cancelar — cancelar una reserva (baja lógica)
router.patch("/:id/cancelar", verificarSesion, cancelarReserva);

// DELETE /api/reservas/:id — eliminar una reserva (baja física)
router.delete("/:id", verificarSesion, eliminarReserva);

module.exports = router;
