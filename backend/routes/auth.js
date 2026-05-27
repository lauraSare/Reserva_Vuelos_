const express = require("express");
const router = express.Router();
const {
  registro,
  login,
  logout,
  verificarSesion,
} = require("../controllers/authController");
const { limiterAuth, verificarCaptcha } = require("../middlewares/seguridad");
const { validarRegistro, validarLogin } = require("../utils/validadores");

// POST /api/auth/registro
router.post("/registro", verificarCaptcha, validarRegistro, registro);

// POST /api/auth/login
router.post("/login", limiterAuth, verificarCaptcha, validarLogin, login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/sesion
router.get("/sesion", verificarSesion);

// GET /api/auth/csrf-token
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: "dev-token" });
});

module.exports = router;
