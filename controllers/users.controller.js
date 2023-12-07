const bcrypt = require('bcryptjs')
const Sequelize = require("sequelize");
const _ = require('lodash');

const db = require('./../models')
const AppResponseDto = require('./../dtos/responses/app_response.dto')
const UserResponseDto = require('./../dtos/responses/user.dto')
const AuthResponseDto = require('./../dtos/responses/auth.dto')
const UserRequestDto = require('./../dtos/requests/user.dto');
const constants = require('./../utils/constants');
const otpGenerator = require('otp-generator')
const PostRequestDto = require("../dtos/requests/posts.dto");
const PostResponseDto = require("../dtos/responses/posts.dto");

const User = db.user;

const Posts = db.posts;
const Categories = db.categories;

const Op = Sequelize.Op;

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // if no email or password then send
        if (!email || !password) {
            res.status(400).send({ error: 'You need an email and password' });
            return;
        }

        const user = await User.findOne({
            where: {
                email: email.trim(),
            },
        });

        if (!user)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("email or password not correct"));

        let matched = bcrypt.compare(password, user.password);

        if (!matched)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("email or password not correct"));

        return res.status(200).json(await AuthResponseDto.loginSuccess(user));
    } catch (error) {
        res.json(AppResponseDto.buildWithErrorMessages(error));
    }

}

exports.create = async (req, res) => {
    try {
        const resultBinding = UserRequestDto.createUserRequestDto(req.body);
        if (!_.isEmpty(resultBinding.errors)) {
            return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
        }

        const email = resultBinding.validatedData.email;
        const username = resultBinding.validatedData.username;
        const phone = resultBinding.validatedData.phone;

        const user = await User.findOne({
            where: {
                email: email.trim(),
                [Op.or]: [
                    {
                        username: {
                            [Op.eq]: username
                        }
                    },
                    {
                        phone: {
                            [Op.eq]: phone
                        }
                    },
                ]
            },
        });

        if (user && user.username === username)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with username already exists"));

        if (user && user.email === email)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with email already exists"));

        if (user && user.phone === phone)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with phone number already exists"));

        const userModel = resultBinding.validatedData;
        await User.create(userModel);

        res.status(201).json(UserResponseDto.registerDto());
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    };
};

exports.update = async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;

        const foundData = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });

        if (!foundData.dataValues)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with id does not exist"));

        const model = foundData.dataValues;
        if (data.email) model.email = data.email;
        if (data.username) model.username = data.username;
        if (data.phone) model.phone = data.phone;
        if (data.firstName) model.firstName = data.firstName;
        if (data.lastName) model.lastName = data.lastName;
        if (data.lastName) model.lastName = data.lastName;

        const updatedUser = await User.update(
            model,
            {
                where: {
                    id: id,
                },
                returning: true,
            }
        );

        const updatedData = updatedUser.dataValues;

        res.status(201).json(UserResponseDto.buildDetails(updatedData));
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    };
};

exports.updatePassword = async (req, res) => {
    try {
        const formData = req.body;
        const resultBinding = UserRequestDto.updatePasswordRequestDto(formData);
        const id = req.params.id;

        const user = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });

        if (!user.dataValues)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with id does not exist"));

        const model = user.dataValues;
        let matched = bcrypt.compare(model.password, model.password);

        if (!matched)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("old password is incorrect"));

        model.password = resultBinding.validatedData.password;
        await User.update(
            model,
            {
                where: {
                    id: id,
                },
                returning: true,
            }
        );

        res.status(201).json(AppResponseDto.buildSuccessWithMessages("password updated successfully"));
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    };
};

exports.requestResetPassword = async (req, res) => {
    try {
        const formData = req.body;
        const resultBinding = UserRequestDto.resetPasswordRequestDto(formData);
        const email = resultBinding.validatedData.email;

        const user = await User.findOne({
            where: {
                email,
                isDeleted: false,
            },
        });

        if (!user)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with email does not exist"));

        const model = user.dataValues;

        model.passwordPin = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: true,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        await User.update(
            model,
            {
                where: {
                    id: model.id,
                },
                returning: true,
            }
        );

        res.status(201).json({
            message: "password updated successfully",
            pin: model.passwordPin
        });
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const formData = req.body;
        const resultBinding = UserRequestDto.resetPasswordDto(formData);
        const email = resultBinding.validatedData.email;
        const otp = resultBinding.validatedData.otp;
        const password = resultBinding.validatedData.password;
        console.log({...resultBinding})
        const user = await User.findOne({
            where: {
                email,
                passwordPin: otp,
                isDeleted: false,
            },
        });
        if (!user)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("user with email does not exist"));

        const model = user.dataValues;
        let matched = bcrypt.compare(model.password, model.password);

        if (!matched)
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages("old password is incorrect"));

        model.password = password;
        model.passwordPin = null;

        await User.update(
            model,
            {
                where: {
                    id: model.id,
                },
                returning: true,
            }
        );

        res.status(201).json(AppResponseDto.buildSuccessWithMessages("password reset successfully"));
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    };
};

exports.findAll = async function (req, res, next) {
    try {
        const { email, search } = req.query;
        const limit = Number(req.query?.limit || constants.DEFAULT_TAKE);
        const offset = Number(req.query?.offset || constants.DEFAULT_SKIP);
        console.log('query', req.query)
        let query = {};
        const subQuery = []
        if (email) {
            subQuery.push({
                email: {
                    [Op.eq]: email
                }
            })
        }
        if (search) {
            subQuery.push({
                firstName: {
                    [Op.like]: search
                },
                lastName: {
                    [Op.like]: search
                },
                email: {
                    [Op.like]: search
                },
                username: {
                    [Op.like]: search
                },
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

        const users = await User.findAndCountAll({
            where: query,
            limit: limit,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ],
        });
        const { rows, count } = users
        return res.json(UserResponseDto.buildPagedList(rows, rows.length, limit, offset, count));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.find = async function (req, res, next) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('User with id not found '));
        const { id } = req.params
        const foundData = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (foundData) {
            return res.json(UserResponseDto.buildDetails(foundData))
        } else {
            return res.json(AppResponseDto.buildWithErrorMessages('User not found'));
        }
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.findSelf = async function (req, res, next) {
    try {
        console.log('gotten to controllers')
        const { id } = req.user;

        const foundData = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        console.log('foundData', foundData)
        if (foundData) {
            return res.json(UserResponseDto.buildDetails(foundData))
        } else {
            return res.json(AppResponseDto.buildWithErrorMessages('User not found'));
        }
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.delete = async function (req, res, next) {
    try {
        const { id } = req.user
        const foundData = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (foundData) {
            await User.update(
                { isDeleted: true },
                {
                    where: {
                        id: id,
                    },
                }
            );
            return res.json(AppResponseDto.buildSuccessWithMessages('User removed successfully'));
        } else {
            return res.json(AppResponseDto.buildWithErrorMessages('User not found'));
        }
    } catch (error) {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + error));
    }
};

exports.findAllPosts = async function (req, res, next) {
    try {
        const {status, search, title} = req.query;
        const limit = Number(req.query?.limit || constants.DEFAULT_TAKE);
        const offset = Number(req.query?.offset || constants.DEFAULT_SKIP);
        let query = {};
        console.log('req.query', req.query);
        const userId = req.user.id;
        const subQuery = [];
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
            },
            // userId,
        })
        query = {
            [Op.and]: subQuery,
        }

        const posts = await Posts.findAndCountAll({
            where: query,
            limit: limit,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ],
            include: [
                { model: Categories, as: 'categories', required: false },
            ],
        });
        const {rows, count} = posts
        return res.json(PostResponseDto.buildPagedList(rows, rows.length, limit, offset, count));
    } catch (error) {
        return res.json(AppResponseDto.buildSuccessWithMessages(error.message));
    }
};

exports.updateMyPost = async function (req, res, ext) {
    try {
        if (!req.params.id) return res.json(AppResponseDto.buildWithErrorMessages('Post with id not found ' + err));
        const data = req.body;
        const id = req.params.id;
        const userId = req.user.id;
        const foundData = await Posts.findOne({
            where: {
                id,
                userId,
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
