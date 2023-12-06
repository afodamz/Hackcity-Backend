const sanitizeInput = require('./../../utils/sanitize').sanitizeInput;
const bcrypt = require('bcryptjs')

exports.create = (body) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    if (!body.title || body.title.trim() === '')
        resultBinding.errors.title = 'title is required';
    else
        resultBinding.validatedData.title = sanitizeInput(body.title);

    if (!body.preacher || body.preacher.trim() === '')
        resultBinding.errors.preacher = 'description is required';
    else
        resultBinding.validatedData.preacher = sanitizeInput(body.preacher);

    if (!body.scripture || body.scripture.trim() === '')
        resultBinding.errors.scripture = 'status is required';
    else
        resultBinding.validatedData.scripture = sanitizeInput(body.scripture);

    if (!body.description || body.description.trim() === '')
        resultBinding.errors.description = 'description is required';
    else
        resultBinding.validatedData.description = sanitizeInput(body.description);

    if (!body.audio || body.audio.trim() === '')
        resultBinding.errors.audio = 'audio is required';
    else
        resultBinding.validatedData.audio = sanitizeInput(body.audio);

    if (!body.image || body.image.trim() === '')
        resultBinding.errors.image = 'image is required';
    else
        resultBinding.validatedData.image = sanitizeInput(body.image);

    return resultBinding;
};