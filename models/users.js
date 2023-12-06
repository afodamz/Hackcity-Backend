module.exports = (sequelize, dbConnection) => {
    const User = dbConnection.define("user", {
        id: {
            type: sequelize.UUID,
            defaultValue: sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        username: { type: sequelize.STRING },
        firstName: { type: sequelize.STRING },
        lastName: { type: sequelize.STRING },
        phone: { type: sequelize.STRING },
        dob: { type: sequelize.DATEONLY },
        lastName: { type: sequelize.STRING },
        userType: { type: sequelize.STRING },
        isVerified: { type: sequelize.BOOLEAN, defaultValue: false  },
        isActive: { type: sequelize.BOOLEAN, defaultValue: false  },
        isDeleted: { type: sequelize.BOOLEAN, defaultValue: false  },
        isAcceptedTerms: { type: sequelize.BOOLEAN, defaultValue: false  },
        email: { type: sequelize.STRING },
        password: { type: sequelize.STRING },
    });
    return User;
};
