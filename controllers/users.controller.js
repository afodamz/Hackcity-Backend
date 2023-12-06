const bcrypt = require('bcryptjs')
const Sequelize = require("sequelize");
const _ = require('lodash');

const db = require('./../models')
const AppResponseDto = require('./../dtos/responses/app_response.dto')
const UserResponseDto = require('./../dtos/responses/user.dto')
const AuthResponseDto = require('./../dtos/responses/auth.dto')
const UserRequestDto = require('./../dtos/requests/user.dto');
const constants = require('./../utils/constants');

const User = db.user;
const Role = db.roles;

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

exports.singup = async (req, res) => {
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
                    // {
                    //     description: {
                    //         [Op.like]: `%${description}%`
                    //     }
                    // }
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
        const newUser = await User.create(userModel);

        //Default assign role as USER
        let roles = await Role.findAll({
            where: {
                name: {
                    // [Sequelize.Op.or]: req.body.roles,
                    [Op.or]: ['ADMIN'],
                },
            },
        });
        await newUser.setRoles(roles);

        res.status(201).json(UserResponseDto.registerDto(user));
    } catch (err) {
        return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
    };
};

exports.createUser = async (formData) => {
    try {
        const resultBinding = UserRequestDto.createUserRequestDto(formData);
        const email = formData.email;
        // const username = formData.username;
        // const firstName = formData.firstName;
        // const lastName = formData.lastName;
        // const roleId = formData.roleId;
        // const password = formData.password;

        const user = await User.findOne({
            where: {
                email: email.trim()
            },
        });

        const userModel = resultBinding.validatedData;
        const newUser = await User.create(userModel);

        //Default assign role as USER
        let roles = await Role.findAll({
            where: {
                name: {
                    // [Sequelize.Op.or]: req.body.roles,
                    [Op.or]: ['ADMIN'],
                },
            },
        });
        await newUser.setRoles(roles);
    } catch (err) {
        return 'created successfully';
    };
};

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
                    // {
                    //     description: {
                    //         [Op.like]: `%${description}%`
                    //     }
                    // }
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
        const newUser = await User.create(userModel);

        //Default assign role as USER
        // const roleId = req.body.roleId.trim();
        const roleIds = req.body.roleIds;
        if (roleIds.length === 0) return res.status(400).send(AppResponseDto.buildWithErrorMessages('role id is required'));
        let roles = await Role.findAll({
            where: {
                id: {
                    // [Sequelize.Op.or]: req.body.roles,
                    // [Op.eq]: roleId,
                    [Op.in]: roleIds,
                },
                // name: {
                //     // [Sequelize.Op.or]: req.body.roles,
                //     [Op.or]: ['USER'],
                // },
            },
        });
        if (roles.length !== roleIds.length) {
            const notFoundIds = [];
            roles.array.forEach(element => {
                if (roleIds.some(roleId => roleId === element.id)) {
                    notFoundIds.push(element)
                }
            });
            return res
                .status(404)
                .json(AppResponseDto.buildWithErrorMessages(`Role with ids ${[...notFoundIds]} not found`));
        }
        await newUser.setRoles(roles);

        res.status(201).json(UserResponseDto.registerDto(user));
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

        //Default assign role as USER
        const roleIds = data.roleIds;
        if (roleIds) {
            let roles = await Role.findAll({
                where: {
                    id: {
                        // [Sequelize.Op.or]: req.body.roles,
                        [Op.in]: roleIds,
                    },
                },
            });
            if (roles.length !== roleIds.length) {
                const notFoundIds = [];
                roles.array.forEach(element => {
                    if (roleIds.some(roleId => roleId === element.id)) {
                        notFoundIds.push(element)
                    }
                });
                return res
                    .status(404)
                    .json(AppResponseDto.buildWithErrorMessages(`Role with ids ${[...notFoundIds]} not found`));
            }
            await newUser.setRoles(roles);
        }

        await User.update(
            model,
            {
                where: {
                    id: id,
                },
                returning: true,
            }
        );
        const updatedSermon = await User.findOne({
            where: {
                id,
                isDeleted: false,
            },
            include: [{ model: Role, as: 'roles', required: false }],
        });

        res.status(201).json(UserResponseDto.buildDetails(updatedSermon));
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
            include: [{ model: Role, as: 'roles', required: false }],
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
        foundData['roles'] = await foundData.getRoles();
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
            include: [{ model: Role, as: 'roles', required: false }],
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