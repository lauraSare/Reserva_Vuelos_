// Rutas de Vuelos — ABCC completo
// Seguridad: verificarSesion protege todas las rutas
const express = require("express");
const router = express.Router();
const {
  obtenerVuelos,
  obtenerVueloPorId,
  crearVuelo,
  actualizarVuelo,
  cancelarVuelo,
  eliminarVuelo,
} = require("../controllers/vueloController");
const { verificarSesion } = require("../middlewares/auth");

// GET /api/vuelos — obtener todos los vuelos
router.get("/", verificarSesion, obtenerVuelos);

// GET /api/vuelos/:id — obtener un vuelo por ID
router.get("/:id", verificarSesion, obtenerVueloPorId);

// POST /api/vuelos — crear un vuelo
router.post("/", verificarSesion, crearVuelo);

// PUT /api/vuelos/:id — actualizar un vuelo
router.put("/:id", verificarSesion, actualizarVuelo);

// PATCH /api/vuelos/:id/cancelar — cancelar un vuelo (baja lógica)
router.patch("/:id/cancelar", verificarSesion, cancelarVuelo);

// DELETE /api/vuelos/:id — eliminar un vuelo (baja física)
router.delete("/:id", verificarSesion, eliminarVuelo);

// GET /api/vuelos/:id/tripulacion — obtener tripulación del vuelo
router.get(
  "/:id/tripulacion",
  verificarSesion,
  require("../controllers/vueloController").obtenerTripulacionVuelo,
);

// POST /api/vuelos/:id/tripulacion — asignar tripulación al vuelo
router.post(
  "/:id/tripulacion",
  verificarSesion,
  require("../controllers/vueloController").asignarTripulacionVuelo,
);

module.exports = router;
