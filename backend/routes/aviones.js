const express = require("express");
const router = express.Router();
const { Avion } = require("../models/index");
const { verificarSesion } = require("../middlewares/auth");

router.get("/", verificarSesion, async (req, res) => {
  try {
    const aviones = await Avion.findAll();
    res.json(aviones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener aviones." });
  }
});

module.exports = router;
