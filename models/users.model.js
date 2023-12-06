module.exports = (sequelize, dbConnection) => {
    return dbConnection.define("user", {
        id: {
            type: sequelize.UUID,
            defaultValue: sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        username: {type: sequelize.STRING},
        firstName: {type: sequelize.STRING},
        lastName: {type: sequelize.STRING},
        passwordPin: {type: sequelize.STRING, allowNull: true},
        phone: {type: sequelize.STRING},
        dob: {type: sequelize.DATEONLY},
        userType: {type: sequelize.STRING},
        isVerified: {type: sequelize.BOOLEAN, defaultValue: false},
        isActive: {type: sequelize.BOOLEAN, defaultValue: false},
        isDeleted: {type: sequelize.BOOLEAN, defaultValue: false},
        isAcceptedTerms: {type: sequelize.BOOLEAN, defaultValue: false},
        email: {type: sequelize.STRING},
        password: {type: sequelize.STRING},
    });
};
