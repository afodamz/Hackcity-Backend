const jwt = require('jsonwebtoken');

const convert_Obj_TO_Array = (object, key) => {
    return object.map(function (obj) {
        return obj[key];
    });
};

const generateTokens = async (user) => {
    try {
        const rolesArray = convert_Obj_TO_Array(await user.getRoles(), 'name');
        const payload = { sub: user.id, id: user.id, roles: rolesArray, userType: user.userType };
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: "2d" }
        );
        const refreshToken = jwt.sign(
            { sub: user.id },
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: "30d" }
        );
        return { accessToken, refreshToken };
    } catch (err) {
        return Promise.reject(err);
    }
};

const verifyRefreshToken = (refreshToken) => {
    const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

    // return new Promise((resolve, reject) => {
    //     UserToken.findOne({ token: refreshToken }, (err, doc) => {
    //         if (!doc)
    //             return reject({ error: true, message: "Invalid refresh token" });

    //         jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
    //             if (err)
    //                 return reject({ error: true, message: "Invalid refresh token" });
    //             resolve({
    //                 tokenDetails,
    //                 error: false,
    //                 message: "Valid refresh token",
    //             });
    //         });
    //     });
    // });

    jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
        if (err)
            return err;
        return tokenDetails
    });
};

const isTokenValid = (token) => jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);

const getPaginator = (take, skip, total) => {
    let page = 1;
    if (take && skip && take > 0 && skip > 0) {
        page = Math.ceil(skip / take);
        page++;
    }
    return {
        total,
        page,
    };
}

module.exports = {
    convert_Obj_TO_Array, getPaginator, isTokenValid, verifyRefreshToken, generateTokens
}