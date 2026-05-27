// Rutas de Pasajeros — ABCC completo
// Seguridad: verificarSesion protege todas las rutas
const express = require("express");
const router = express.Router();
const {
  obtenerPasajeros,
  obtenerPasajeroPorId,
  crearPasajero,
  actualizarPasajero,
  eliminarPasajero,
} = require("../controllers/pasajeroController");
const { verificarSesion } = require("../middlewares/auth");

// GET /api/pasajeros — obtener todos los pasajeros
router.get("/", verificarSesion, obtenerPasajeros);

// GET /api/pasajeros/:id — obtener un pasajero por ID
router.get("/:id", verificarSesion, obtenerPasajeroPorId);

// POST /api/pasajeros — crear un pasajero
router.post("/", verificarSesion, crearPasajero);

// PUT /api/pasajeros/:id — actualizar un pasajero
router.put("/:id", verificarSesion, actualizarPasajero);

// DELETE /api/pasajeros/:id — eliminar un pasajero
router.delete("/:id", verificarSesion, eliminarPasajero);

module.exports = router;
