const sequelize = require("sequelize");
const dbConnection = require("../config/db");

const db = {};
db.roles = require("./roles.model")(sequelize, dbConnection);
db.user = require("./user.model")(sequelize, dbConnection);
// db.product = require("./productModel")(sequelize, dbConnection);
// db.category = require("./categoryModel")(sequelize, dbConnection);

db.roles.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});

db.user.belongsToMany(db.roles, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});

db.contactUs = require("./contact-us.model")(sequelize, dbConnection);

db.newsLetter = require("./news-letter.model")(sequelize, dbConnection);

db.files = require("./files.model")(sequelize, dbConnection);

db.email = require("./emails.model")(sequelize, dbConnection);

db.sermon = require("./sermons.model")(sequelize, dbConnection);

db.gallery = require("./gallery.model")(sequelize, dbConnection);

db.testimony = require("./testimony.model")(sequelize, dbConnection);

db.career = require("./career.model")(sequelize, dbConnection);

db.departments = require("./departments.model")(sequelize, dbConnection);

db.departments.belongsToMany(db.user, {
  through: "user_department",
  foreignKey: "departmentId",
  otherKey: "userId",
});

db.user.belongsToMany(db.departments, {
  through: "user_department",
  foreignKey: "userId",
  otherKey: "departmentId",
});

db.preacher = require("./preacher.model")(sequelize, dbConnection);

db.sermon.belongsTo(db.preacher, {
  foreignKey: "preacherId",
  as: "preacher",
});

// db.preacher.hasMany(db.sermon, { as: "sermons" });
db.preacher.hasMany(db.sermon, { foreignKey: 'preacherId' });

// db.user.hasMany(db.newsLetter, { as: "newsLetterSent" });

// db.newsLetter.belongsTo(db.user, {
//   foreignKey: "sentById",
//   as: "sentBy",
// });

module.exports = db;
