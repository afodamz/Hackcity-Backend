module.exports = (sequelize, dbConnection) => {
    return dbConnection.define("categories", {
        id: {
            type: sequelize.UUID,
            defaultValue: sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {type: sequelize.STRING},
        description: {type: sequelize.STRING},
        isDeleted: {type: sequelize.BOOLEAN, defaultValue: false},
    });
};
