const jwt = require('jsonwebtoken');
const isTokenValid = require('./../utils').isTokenValid;
const convert_Obj_TO_Array = require('./../utils').convert_Obj_TO_Array;
const AppResponseDto = require('../dtos/responses/app_response.dto');

const checkToken = (req) => isTokenValid(getTokenFromHeader(req));

function getTokenFromHeader(req) {
    
    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')
        && req.headers.authorization.split(' ')[0] === 'Token' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }

    return null;
}

/**
 *  Decode user's token
 * */
const readToken = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || (!authHeader.startsWith('Bearer')
        && req.headers.hasOwnProperty('authorization'))
        && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return res.status(401).json(AppResponseDto.buildWithErrorMessages('UnAthorized to perform action'))
    }
    // if the loadoUser middleware has already laoded the user then no need to reload it again
    if (req.user != null)
        return next();

        try {
            const payload = checkToken(req, res, next);
            // attach the user to the job routes
            req.user = payload;
            next();
        } catch (error) {
            return res.status(401).json(AppResponseDto.buildWithErrorMessages('UnAthorized to authorize user'))
        }
};

exports.isAuthenticated = (req, res, next) => {
    if (req.user != null) {
        next();
        return;
    }
    return res.json(AppResponseDto.buildWithErrorMessages('Permission denied, you must be authenticated'))
};

exports.generateJwtSync = async function (user) {

    return jwt.sign(
        {
            sub: user.id, id: user.id, userType: user.userType
        },
        process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
        { expiresIn: process.env.EXPIRE_TIME || 360000 }
    );
};
// exports.mustBeAuthenticated = [readToken, getFreshUser(true)];
exports.mustBeAuthenticated = readToken;
// exports.loadUser = [readToken, getFreshUser(false)];

exports.userOwnsItOrIsAdmin = (req, res, next) => {
    if (req.user != null && (req.rawUser.isAdminSync() || req.userOwnable.user_id === req.user.id))
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('This resource does not belong to you'));
};
