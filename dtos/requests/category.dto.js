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

    if (!body.description || body.description.trim() === '')
        resultBinding.errors.description = 'description is required';
    else
        resultBinding.validatedData.description = sanitizeInput(body.description);

    return resultBinding;
};