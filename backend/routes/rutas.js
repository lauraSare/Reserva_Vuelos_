const express = require("express");
const router = express.Router();
const { Ruta, Aeropuerto } = require("../models/index");
const { verificarSesion } = require("../middlewares/auth");

router.get("/", verificarSesion, async (req, res) => {
  try {
    const rutas = await Ruta.findAll({
      include: [
        { model: Aeropuerto, as: "origen" },
        { model: Aeropuerto, as: "destino" },
      ],
    });
    console.log('Rutas con aeropuertos:', JSON.stringify(rutas[0], null, 2));
res.json(rutas);
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    res.status(500).json({ message: "Error al obtener rutas." });
  }
});

module.exports = router;
