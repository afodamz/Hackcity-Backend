module.exports = (sequelize, dbConnection) => {
    return dbConnection.define("posts", {
        id: {
            type: sequelize.UUID,
            defaultValue: sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        title: {type: sequelize.STRING},
        image: {type: sequelize.STRING},
        content: {type: sequelize.STRING},
        isDeleted: {type: sequelize.BOOLEAN, defaultValue: false},
    });
};
