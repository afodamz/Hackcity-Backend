const Sequelize = require("sequelize");
const _ = require('lodash');
const db = require('./../models')
const constants = require('./../utils/constants');
const CategoryResponseDto = require('../dtos/responses/category.dto');
const CategoryRequestDto = require('./../dtos/requests/category.dto');
const AppResponseDto = require('./../dtos/responses/app_response.dto')

const Categories = db.categories;

const Op = Sequelize.Op;

exports.findAll = async function (req, res, next) {
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

        const categories = await Categories.findAndCountAll({
            where: query,
            limit: limit,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ],
        });
        const {rows, count} = categories
        return res.json(CategoryResponseDto.buildPagedList(rows, rows.length, limit, offset, count));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.find = async function (req, res, next) {
    try {
        const {search, title} = req.query;
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

        const category = await Categories.findOne({
            where: query,
        });
        return res.json(CategoryResponseDto.buildDto(category));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.create = async function (req, res, next) {
    try {
        const resultBinding = await CategoryRequestDto.create(req.body);
        if (!_.isEmpty(resultBinding.errors)) {
            return res.json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
        }
        const name = resultBinding.validatedData.name;
        const description = resultBinding.validatedData.description;

        const savedPost = await Categories.create({
            name,
            description,
        });

        const foundData = await Categories.findOne({
            where: {
                id: savedPost.dataValues.id,
                isDeleted: false,
            },
        });
        return res.json(CategoryResponseDto.buildDetails(foundData.dataValues, false, false));

    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages(error.message));
    }
};

exports.update = async function (req, res, ext) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Category with id not found ' + err));
        const data = req.body;
        const id = req.params.id;
        const foundData = await Categories.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (!foundData.dataValues) return res.json(AppResponseDto.buildWithErrorMessages('Post not found'));
        const model = foundData.dataValues;
        if (data.title) model.title = data.title;
        if (data.description) model.description = data.description;

        await Categories.update(
            model,
            {
                where: {
                    id: id,
                },
                returning: true,
            }
        );
        const updatedPost = await Categories.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        // console.log('updatedPost', updatedPost)
        const updatedData = updatedPost.dataValues;
        // const updatedData = {...foundData.dataValues, ...model}
        return res.json(CategoryResponseDto.buildDetails(updatedData))
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.delete = async function (req, res, next) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Category with id not found '));
        const id = req.params.id;
        const foundData = await Categories.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });
        if (!foundData) return res.json(AppResponseDto.buildWithErrorMessages('Category not found'));
        await Categories.update(
            {isDeleted: true},
            {
                where: {
                    id: id,
                },
            }
        );
        return res.json(AppResponseDto.buildSuccessWithMessages('Category removed successfully'));
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.findOne = async function (req, res, next) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Category with id not found '));
        const foundData = await Categories.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });
        if (foundData) {
            return res.json(CategoryResponseDto.buildDetails(foundData))
        } else {
            return res.json(AppResponseDto.buildWithErrorMessages('Category not found'));
        }
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};