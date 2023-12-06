const utils = require('./../../utils')

async function loginSuccess(user) {
    //Generate token
    const tokens = await utils.generateTokens(user);
    return {
        success: true,
        message: "login successful",
        tokens,
    }
}

function buildOnlyForIdAndUsername(user) {
    if (user == null)
        return {};
    return {
        id: user.id,
        username: user.username
    }
}

module.exports = {
    loginSuccess, buildOnlyForIdAndUsername
};