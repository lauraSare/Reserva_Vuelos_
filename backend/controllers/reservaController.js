// Controlador de Reservas — maneja el ABCC completo
// Principio SOLID: Single Responsibility — solo maneja lógica de reservas
// Principio SOLID - Open/Closed: nuevas operaciones se agregan sin modificar las existentes
// Principio SOLID - Dependency Inversion: depende de modelos Sequelize no de consultas directas
// Patron de diseño - Strategy: calculo de descuentos intercambiable segun tipo de ruta y clase
// Clean Code: funciones con un solo proposito, manejo de errores consistente en todas las operaciones
const {
  Reserva,
  Pasajero,
  Vuelo,
  GrupoReserva,
  Pago,
  Ruta,
  Avion,
  Aeropuerto,
} = require("../models/index");

// ─── Obtener todas las reservas ───────────────────────────────
const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Pasajero },
        {
          model: Vuelo,
          as: "Vuelo",
          include: [
            {
              model: Ruta,
              as: "Ruta",
              include: [
                { model: Aeropuerto, as: "origen" },
                { model: Aeropuerto, as: "destino" },
              ],
            },
            { model: Avion },
          ],
        },
        { model: GrupoReserva, include: [{ model: Pago }] },
      ],
    });
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ─── Obtener una reserva por ID ───────────────────────────────
const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id, {
      include: [
        { model: Pasajero },
        { model: Vuelo, as: "Vuelo" },
        { model: GrupoReserva },
      ],
    });
    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada." });
    res.json(reserva);
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ─── Crear una reserva con pago ───────────────────────────────
const crearReserva = async (req, res) => {
  try {
    const { id_vuelo, id_pasajero, clase, metodo_pago, monto, id_asiento } = req.body;

    // Verificar que el pasajero no tenga reserva activa en este vuelo
    const reservaExistente = await Reserva.findOne({
      where: { id_pasajero, id_vuelo, estado: "confirmada" },
    });
    if (reservaExistente) {
      return res
        .status(400)
        .json({
          message: "El pasajero ya tiene una reserva confirmada en este vuelo.",
        });
    }

    // Crear grupo de reserva
    const grupo = await GrupoReserva.create({
      id_pasajero_responsable: id_pasajero,
    });

    // Crear la reserva
    const nuevaReserva = await Reserva.create({
      id_vuelo,
      id_pasajero,
      id_grupo: grupo.id_grupo,
      estado: "confirmada",
      clase: clase || "turista",
    });

    // Guardar asiento seleccionado en vuelo_asientos
    if (id_asiento) {
      const { sequelize } = require("../models/index");
      await sequelize.query(
        `INSERT INTO vuelo_asientos (id_vuelo, id_asiento, estado)
         VALUES (:id_vuelo, :id_asiento, 'ocupado')
         ON DUPLICATE KEY UPDATE estado = 'ocupado'`,
        { replacements: { id_vuelo, id_asiento } }
      );
    }

    // Crear el pago
    await Pago.create({
      metodo: metodo_pago || "transferencia",
      monto_total: monto,
      moneda: "MXN",
      estado: "completado",
      id_grupo: grupo.id_grupo,
    });

    res
      .status(201)
      .json({
        message: "Reserva creada correctamente.",
        reserva: nuevaReserva,
      });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ─── Actualizar una reserva ───────────────────────────────────
const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const reserva = await Reserva.findByPk(id);
    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada." });
    await reserva.update({ estado });
    res.json({ message: "Reserva actualizada correctamente.", reserva });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ─── Cancelar una reserva ─────────────────────────────────────
const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id);
    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada." });
    await reserva.update({ estado: "cancelada" });
    res.json({ message: "Reserva cancelada correctamente.", reserva });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ─── Eliminar una reserva ─────────────────────────────────────
const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id);
    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada." });
    await reserva.destroy();
    res.json({ message: "Reserva eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva,
  eliminarReserva,
};
