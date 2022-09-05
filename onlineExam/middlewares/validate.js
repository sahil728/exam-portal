const universalFunction = require('../lib/universal-function.js');

module.exports = function (schema) {

    return function (req, res, next) {

        if (schema.body) {
            const { error, value } = schema.body.validate(req.body);
            if (error) {
                return universalFunction.validationError(res, error)
            } else {
                req.body = value;
                next()
            }
        }

        else if (schema.query) {
            const { error, value } = schema.query.validate(req.query);
            if (error) {
                return universalFunction.validationError(res, error)
            }
            else {
                req.query = value;
                next()
            }
        }
        else {
            const { error, value } = schema.params.validate(req.params);
            if (error) {
                return universalFunction.validationError(res, error);
            }
            else {
                req.params = value
                next()
            }
        }
    }
};

