const PageMetaDto = require('./page_meta.dto');
const CategoryDto = require("./category.dto");

function buildPagedList(sermon, count, limit, offset, total) {
    return {
        success: true,
        count,
        ...PageMetaDto.build(limit, offset, total),
        result: buildDtos(sermon),
    }
}

function buildDtos(sermon) {
    if (sermon == null)
        return {sermon: []};
    return sermon.map(contact => buildDto(contact.dataValues));
}

function buildDto(sermon) {
    console.log('sermon?.preacher', sermon)
    return {
        id: sermon.id,
        title: sermon.title,
        scripture: sermon.scripture,
        description: sermon?.description,
        audio: sermon?.audio,
        status: sermon.status,
        image: sermon?.image,
        video: sermon?.video,
        preacher: PreacherDto.buildDto(sermon?.preacher),
        date: sermon?.date,
        createdAt: sermon.createdAt,
        updatedAt: sermon.updatedAt,
    };
}

function buildDetails(sermon) {
    return {
        success: true,
        result: buildDto(sermon),
    }
}

module.exports = {
    buildDtos, buildDto, buildDetails, buildPagedList
};