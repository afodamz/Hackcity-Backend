const sequelize = require("sequelize");

const sequelizeInstance = new sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  operatorsAliases: 0,
  pool: {
    max: 5,
    min: 0,
    aquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelizeInstance;