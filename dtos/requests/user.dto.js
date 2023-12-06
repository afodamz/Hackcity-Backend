const sanitizeInput = require('./../../utils/sanitize').sanitizeInput;
const bcrypt = require('bcryptjs')

exports.createUserRequestDto = (body) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!body.firstName || body.firstName.trim() === '')
        resultBinding.errors.firstName = 'firstName is required';
    else
        resultBinding.validatedData.firstName = sanitizeInput(body.firstName);

    if (!body.lastName || body.lastName.trim() === '')
        resultBinding.errors.lastName = 'LastName is required';
    else
        resultBinding.validatedData.lastName = sanitizeInput(body.lastName);

    if (!body.username || body.username.trim() === '')
        resultBinding.errors.username = 'Username is required';
    else
        resultBinding.validatedData.username = sanitizeInput(body.username);

    if (body.email && body.email.trim() !== '' && emailRegex.test(String(body.email).toLowerCase()))
        resultBinding.validatedData.email = sanitizeInput(body.email.toLowerCase());
    else
        resultBinding.errors.email = 'Email is required';

    if (body.phone && body.phone.trim() !== '')
        resultBinding.validatedData.phone = sanitizeInput(body.phone);
    else
        resultBinding.errors.phone = 'Phone is required';

    if (body.password && body.password.trim() !== '')
        resultBinding.validatedData.password = bcrypt.hashSync(body.password.trim());
    else
        resultBinding.errors.password = 'Password must not be empty';

    if (!body.confirmPassword || body.confirmPassword.trim() === '' || body.confirmPassword !== body.password)
        resultBinding.errors.confirmPassword = 'Confirmation password must not be empty and matching password';

    return resultBinding;
};

exports.updatePasswordRequestDto = (body) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    if (body.oldPassword && body.oldPassword.trim() !== '')
        resultBinding.validatedData.oldPassword = bcrypt.hashSync(body.oldPassword.trim());
    else
        resultBinding.errors.oldPassword = 'Old Password must not be empty';

    if (body.password && body.password.trim() !== '')
        resultBinding.validatedData.password = bcrypt.hashSync(body.password.trim());
    else
        resultBinding.errors.password = 'Password must not be empty';

    if (!body.confirmPassword || body.confirmPassword.trim() === '' || body.confirmPassword !== body.password)
        resultBinding.errors.confirmPassword = 'Confirmation password must not be empty and matching password';

    return resultBinding;
};