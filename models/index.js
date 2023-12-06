const sequelize = require("sequelize");
const dbConnection = require("../config/db");

const db = {};
db.user = require("./users.model")(sequelize, dbConnection);

db.categories = require("./categories.model")(sequelize, dbConnection);

db.posts = require("./posts.model")(sequelize, dbConnection);

db.posts.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

db.user.hasMany(db.posts, { foreignKey: 'userId' });

db.categories.belongsToMany(db.user, {
    through: "post_categories",
  foreignKey: "categoryId",
  otherKey: "postId",
});

db.posts.belongsToMany(db.categories, {
  through: "post_categories",
  foreignKey: "postId",
  otherKey: "categoryId",
});

module.exports = db;
