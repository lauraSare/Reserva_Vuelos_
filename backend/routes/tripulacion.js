// Rutas de Tripulación — ABCC completo
// Seguridad: verificarSesion protege todas las rutas
const express = require("express");
const router = express.Router();
const {
  obtenerTripulacion,
  obtenerTripulacionPorId,
  crearTripulacion,
  actualizarTripulacion,
  eliminarTripulacion,
} = require("../controllers/tripulacionController");
const { verificarSesion } = require("../middlewares/auth");

// GET /api/tripulacion — obtener toda la tripulación
router.get("/", verificarSesion, obtenerTripulacion);

// GET /api/tripulacion/:id — obtener un miembro por ID
router.get("/:id", verificarSesion, obtenerTripulacionPorId);

// POST /api/tripulacion — crear un miembro
router.post("/", verificarSesion, crearTripulacion);

// PUT /api/tripulacion/:id — actualizar un miembro
router.put("/:id", verificarSesion, actualizarTripulacion);

// DELETE /api/tripulacion/:id — eliminar un miembro
router.delete("/:id", verificarSesion, eliminarTripulacion);

module.exports = router;
