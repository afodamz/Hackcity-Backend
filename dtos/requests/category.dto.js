const sanitizeInput = require('./../../utils/sanitize').sanitizeInput;

exports.create = (body) => {
    const resultBinding = {
        validatedData: {},
        errors: {},
    };

    if (!body.name || body.name.trim() === '')
        resultBinding.errors.name = 'category name is required';
    else
        resultBinding.validatedData.name = sanitizeInput(body.name);

    if (!body.description || body.description.trim() === '')
        resultBinding.errors.description = 'category description is required';
    else
        resultBinding.validatedData.description = sanitizeInput(body.description);

    return resultBinding;
};