// Middleware de autenticación — protege rutas que requieren sesión activa
// Seguridad: No permite acceso si el usuario no se ha autenticado
const verificarSesion = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ message: 'No autorizado. Inicia sesión.' });
  }
  next(); // Si hay sesión activa, continúa
};

module.exports = { verificarSesion };