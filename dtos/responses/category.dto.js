const PageMetaDto = require('./page_meta.dto');

function buildPagedList(category, count, limit, offset, total) {
    return {
        success: true,
        count,
        ...PageMetaDto.build(limit, offset, total),
        result: buildDtos(category),
    }
}

function buildDtos(categories) {
    if (categories == null)
        return {categories: []};
    return categories.map(contact => buildDto(contact.dataValues));
}

function buildDto(category) {
    console.log('category?', category)
    return {
        id: category.id,
        name: category.name,
        description: category?.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    };
}

function buildDetails(category) {
    return {
        success: true,
        result: buildDto(category),
    }
}

module.exports = {
    buildDtos, buildDto, buildDetails, buildPagedList
};