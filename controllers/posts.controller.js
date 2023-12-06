const Sequelize = require("sequelize");
const _ = require('lodash');
const db = require('./../models')
const constants = require('./../utils/constants');
const PostResponseDto = require('../dtos/responses/posts.dto');
const PostRequestDto = require('./../dtos/requests/posts.dto');
const AppResponseDto = require('./../dtos/responses/app_response.dto')

const Posts = db.posts;
const Categories = db.categories;

const Op = Sequelize.Op;

exports.findAll = async function (req, res, next) {
    try {
        const {status, search, title} = req.query;
        const limit = Number(req.query?.limit || constants.DEFAULT_TAKE);
        const offset = Number(req.query?.offset || constants.DEFAULT_SKIP);
        let query = {};
        console.log('req.query', req.query);
        const subQuery = []
        if (status) {
            subQuery.push({
                status: {
                    [Op.eq]: status
                }
            })
        }
        if (title) {
            subQuery.push({
                title: {
                    [Op.eq]: title
                }
            })
        }
        if (search) {
            subQuery.push({
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${search}%`
                        },
                    },
                    {
                        content: {
                            [Op.like]: search
                        },
                    },
                ]
            })
        }
        subQuery.push({
            isDeleted: {
                [Op.eq]: false
            }
        })
        query = {
            [Op.and]: subQuery,
        }

        const sermons = await Post.findAndCountAll({
            where: query,
            limit: limit,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ],
            include: [{ model: Categories, as: 'categories', required: false }],
        });
        const {rows, count} = sermons
        return res.json(PostResponseDto.buildPagedList(rows, rows.length, limit, offset, count));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.find = async function (req, res, next) {
    try {
        const {status, search, title} = req.query;
        const limit = Number(req.query?.limit || constants.DEFAULT_TAKE);
        const offset = Number(req.query?.offset || constants.DEFAULT_SKIP);
        let query = {};
        const subQuery = []
        if (title) {
            subQuery.push({
                title: {
                    [Op.eq]: title
                }
            })
        }
        if (search) {
            subQuery.push({
                title: {
                    [Op.like]: search
                },
                content: {
                    [Op.like]: search
                },
            })
        }
        subQuery.push({
            isDeleted: {
                [Op.eq]: false
            },
        })
        query = {
            [Op.and]: subQuery,
        }

        const sermons = await Posts.findAndCountAll({
            where: query,
            limit: limit,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ],
            include: [{ model: Categories, as: 'categories', required: false }],
        });
        const {rows, count} = sermons
        return res.json(PostResponseDto.buildPagedList(rows, rows.length, limit, offset, count));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.create = async function (req, res, next) {
    try {
        const resultBinding = await PostRequestDto.create(req.body);
        if (!_.isEmpty(resultBinding.errors)) {
            return res.json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
        }
        const title = resultBinding.validatedData.title;
        const content = req.body.content;
        const image = req.body.image;

        // let foundCategories = await Categories.findOne({
        //     where: {
        //         id: categories,
        //         isDeleted: false,
        //     },
        // });
        // if (!foundCategories) return res.json(AppResponseDto.buildWithErrorMessages('Preacher not found'));
        const savedPost = await Posts.create({
            title,
            content,
            image,
        });

        const foundData = await Posts.findOne({
            where: {
                id: savedPost.dataValues.id,
                isDeleted: false,
            },
            include: [{ model: Categories, as: 'categories', required: false }],
        });
        return res.json(PostResponseDto.buildDetails(foundData.dataValues, false, false));

    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages(error.message));
    }
};

exports.update = async function (req, res, ext) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Post with id not found ' + err));
        const data = req.body;
        const id = req.params.id;
        const foundData = await Posts.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (!foundData.dataValues) return res.json(AppResponseDto.buildWithErrorMessages('Post not found'));
        const model = foundData.dataValues;
        if (data.title) model.title = data.title;
        if (data.content) model.content = data.content;
        if (data.image) model.image = data.image;

        await Posts.update(
            model,
            {
                where: {
                    id: id,
                },
                returning: true,
            }
        );
        const updatedPost = await Post.findOne({
            where: {
                id,
                isDeleted: false,
            },
            include: [{ model: Categories, as: 'categories', required: false }],
        });
        // console.log('updatedPost', updatedPost)
        const updatedData = updatedPost.dataValues;
        // const updatedData = {...foundData.dataValues, ...model}
        return res.json(PostResponseDto.buildDetails(updatedData))
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.delete = async function (req, res, next) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Post with id not found '));
        const id = req.params.id;
        const foundData = await Posts.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });
        if (!foundData) return res.json(AppResponseDto.buildWithErrorMessages('Post not found'));
        await Posts.update(
            {isDeleted: true},
            {
                where: {
                    id: id,
                },
            }
        );
        return res.json(AppResponseDto.buildSuccessWithMessages('Post removed successfully'));
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.findOne = async function (req, res, next) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Post with id not found '));
        const foundData = await Posts.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });
        if (foundData) {
            return res.json(PostResponseDto.buildDetails(foundData))
        } else {
            return res.json(AppResponseDto.buildWithErrorMessages('Post not found'));
        }
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};