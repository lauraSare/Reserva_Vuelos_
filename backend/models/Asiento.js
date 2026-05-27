// Modelo de Asiento — representa los asientos físicos de cada avión
// La disponibilidad por vuelo se maneja en vuelo_asientos (tabla intermedia)
// Principio SOLID: Single Responsibility — solo maneja datos del asiento
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Asiento = sequelize.define(
  "Asiento",
  {
    id_asiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_asiento: {
      type: DataTypes.STRING(45),
      allowNull: false, // Ej. 1A, 2B, 12C
    },
    clase: {
      type: DataTypes.ENUM("turista", "ejecutiva", "primera_clase"),
      allowNull: false,
    },
    id_avion: {
      type: DataTypes.INTEGER,
      allowNull: false, // FK hacia aviones
    },
  },
  {
    tableName: "asientos",
    timestamps: false,
  },
);

module.exports = Asiento;
