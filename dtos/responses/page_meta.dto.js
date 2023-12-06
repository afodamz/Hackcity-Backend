const getPaginator = require('./../../utils').getPaginator;

module.exports = {

    build(limit, offset, total) {
        return {
            ...getPaginator(limit, offset, total)
        };

    }
};
