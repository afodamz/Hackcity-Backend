const sanitizeInput = require('./../../utils/sanitize').sanitizeInput;

exports.create = (body) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    if (!body.title || body.title.trim() === '')
        resultBinding.errors.title = 'title is required';
    else
        resultBinding.validatedData.title = sanitizeInput(body.title);

    if (!body.content || body.content.trim() === '')
        resultBinding.errors.content = 'content is required';
    else
        resultBinding.validatedData.content = sanitizeInput(body.content);

    if (!body.image || body.image.trim() === '')
        resultBinding.errors.image = 'image is required';
    else
        resultBinding.validatedData.image = sanitizeInput(body.image);

    return resultBinding;
};