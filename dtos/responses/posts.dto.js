const PageMetaDto = require('./page_meta.dto');
const CategoryDto = require("./category.dto");
const UserDto = require("./user.dto");

function buildPagedList(post, count, limit, offset, total) {
    return {
        success: true,
        count,
        ...PageMetaDto.build(limit, offset, total),
        result: buildDtos(post),
    }
}

function buildDtos(post) {
    if (post == null)
        return {post: []};
    return post.map(contact => buildDto(contact.dataValues));
}

function buildDto(post) {
    return {
        id: post.id,
        title: post.title,
        description: post?.description,
        status: post.status,
        image: post?.image,
        categories: CategoryDto.buildDtos(post?.categories),
        createdBy: UserDto.buildUserDto(post?.user),
        date: post?.date,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

function buildDetails(post) {
    return {
        success: true,
        result: buildDto(post),
    }
}

module.exports = {
    buildDtos, buildDto, buildDetails, buildPagedList
};