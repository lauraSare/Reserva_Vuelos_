// Principio SOLID - Single Responsibility: este archivo solo define rutas de reservas
// Principio SOLID - Open/Closed: nuevas rutas se agregan sin modificar las existentes
// Patron de diseño - Chain of Responsibility: verificarSesion protege cada ruta antes del controlador
// Clean Code: rutas claras con metodos HTTP correctos, GET obtener, POST crear, PUT actualizar, DELETE eliminar
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

// GET /api/reservas/:id/boleto — obtener todos los datos para el boleto PDF
router.get("/:id/boleto", verificarSesion, async (req, res) => {
  try {
    const { id } = req.params;
    const { sequelize } = require("../models/index");

    // Datos completos de la reserva
    const [reserva] = await sequelize.query(
      `
      SELECT 
        r.id_reserva, r.fecha_reserva, r.estado, r.clase,
        p.nombre, p.primer_apellido, p.segundo_apellido,
        p.num_pasaporte, p.nacionalidad, p.correo, p.telefono,
        v.codigo_vuelo, v.fecha_salida, v.fecha_llegada, v.estado as estado_vuelo,
        av.matricula, av.modelo, av.fabricante,
        ao.nombre as origen_nombre, ao.codigo_iata as origen_iata, ao.ciudad as origen_ciudad, ao.pais as origen_pais,
        ad.nombre as destino_nombre, ad.codigo_iata as destino_iata, ad.ciudad as destino_ciudad, ad.pais as destino_pais,
        ru.distancia_km, ru.duracion_estimada,
        a.numero_asiento, a.clase as clase_asiento,
        pg.metodo, pg.monto_total, pg.moneda, pg.fecha_transaccion
      FROM reservas r
      JOIN pasajeros p ON r.id_pasajero = p.id_pasajeros
      JOIN vuelos v ON r.id_vuelo = v.id_vuelo
      JOIN aviones av ON v.id_avion = av.id_avion
      JOIN rutas ru ON v.id_ruta = ru.id_ruta
      JOIN aeropuertos ao ON ru.id_origen = ao.id_aeropuerto
      JOIN aeropuertos ad ON ru.id_destino = ad.id_aeropuerto
      LEFT JOIN vuelo_asientos va ON va.id_vuelo = v.id_vuelo AND va.estado = 'ocupado' AND va.id_asiento IN (
        SELECT id_asiento FROM asientos WHERE id_avion = av.id_avion
      )
      LEFT JOIN asientos a ON va.id_asiento = a.id_asiento
      LEFT JOIN grupo_reserva gr ON r.id_grupo = gr.id_grupo
      LEFT JOIN pagos pg ON gr.id_grupo = pg.id_grupo
      WHERE r.id_reserva = :id
      LIMIT 1
    `,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT },
    );

    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada." });

    // Validar que tenga todos los datos necesarios
    const faltantes = [];
    if (!reserva.numero_asiento) faltantes.push("asiento");
    if (!reserva.metodo) faltantes.push("pago");

    // Tripulación del vuelo
    const tripulacion = await sequelize.query(
      `
      SELECT t.nombre, t.primer_apellido, vt.rol_en_vuelo as rol
      FROM vuelo_tripulacion vt
      JOIN tripulacion t ON vt.id_tripulacion = t.id_tripulacion
      WHERE vt.id_vuelo = (SELECT id_vuelo FROM reservas WHERE id_reserva = :id)
    `,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT },
    );

    if (tripulacion.length === 0) faltantes.push("tripulación");

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan datos para generar el boleto: ${faltantes.join(", ")}.`,
        faltantes,
      });
    }

    res.json({ reserva, tripulacion });
  } catch (error) {
    console.error("Error al obtener boleto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// GET /api/reservas/grupos/todos — obtener todos los grupos con sus reservas y pagos
router.get("/grupos/todos", verificarSesion, async (req, res) => {
  try {
    const { sequelize } = require("../models/index");
    const grupos = await sequelize.query(`
      SELECT 
        gr.id_grupo, gr.fecha_creacion,
        p.nombre AS responsable_nombre, p.primer_apellido AS responsable_apellido,
        COUNT(r.id_reserva) AS total_reservas,
        v.codigo_vuelo, ao.ciudad AS origen, ad.ciudad AS destino,
        pg.metodo, pg.monto_total, pg.moneda
      FROM grupo_reserva gr
      JOIN pasajeros p ON gr.id_pasajero_responsable = p.id_pasajeros
      LEFT JOIN reservas r ON gr.id_grupo = r.id_grupo
      LEFT JOIN vuelos v ON r.id_vuelo = v.id_vuelo
      LEFT JOIN rutas ru ON v.id_ruta = ru.id_ruta
      LEFT JOIN aeropuertos ao ON ru.id_origen = ao.id_aeropuerto
      LEFT JOIN aeropuertos ad ON ru.id_destino = ad.id_aeropuerto
      LEFT JOIN pagos pg ON gr.id_grupo = pg.id_grupo
      GROUP BY gr.id_grupo, gr.fecha_creacion, p.nombre, p.primer_apellido,
               v.codigo_vuelo, ao.ciudad, ad.ciudad, pg.metodo, pg.monto_total, pg.moneda
      ORDER BY gr.fecha_creacion DESC
    `, { type: sequelize.QueryTypes.SELECT })
    res.json(grupos)
  } catch (error) {
    console.error("Error al obtener grupos:", error)
    res.status(500).json({ message: "Error interno del servidor." })
  }
});

// PATCH /api/reservas/:id/cancelar — cancelar una reserva (baja lógica)
router.patch("/:id/cancelar", verificarSesion, cancelarReserva);

// GET /api/reservas/:id — obtener una reserva por ID
router.get("/:id", verificarSesion, obtenerReservaPorId);

// POST /api/reservas — crear una reserva
router.post("/", verificarSesion, crearReserva);

// PUT /api/reservas/:id — actualizar una reserva
router.put("/:id", verificarSesion, actualizarReserva);

// DELETE /api/reservas/:id — eliminar una reserva (baja física)
router.delete("/:id", verificarSesion, eliminarReserva);

module.exports = router;
