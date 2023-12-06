const getPaginator = require('./../../utils').getPaginator;

module.exports = {

    build(limit, offset, total) {
        const data = {
            ...getPaginator(limit, offset, total)
        };
        return data;

    }
};
