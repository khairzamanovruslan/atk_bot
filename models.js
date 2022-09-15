const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idUser: {
    type: DataTypes.INTEGER,
  },
  firstName: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
});

module.exports = { User };
