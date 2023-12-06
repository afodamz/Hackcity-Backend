
const PageMetaDto = require('./page_meta.dto');

function buildPagedList(user, count, limit, offset, total) {
    return {
        success: true,
        count,
        ...PageMetaDto.build(limit, offset, total),
        result: buildDtos(user),
    }
}

function buildDtos(user) {
    if (user == null)
        return {user: []};
    return user.map(contact => buildDto(contact.dataValues));
}

function buildDto(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        userType: user.userType,
        isVerified: user.isVerified,
        isActive: user.isActive,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function buildDetails(user) {
    return {
        success: true,
        result: buildDto(user),
    }
}

function registerDto() {
    return {
        success: true,
        full_messages: ['User registered successfully']
    };
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
    registerDto, buildOnlyForIdAndUsername, buildPagedList, buildDetails, buildDtos
};