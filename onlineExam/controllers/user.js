const Handler = require('../handlers');
const APP_CONSTANTS = require('../constant/App_Constant.js');
const universalFunction = require('../lib/universal-function.js')

module.exports.register = async (req, res) => {
    try {
        req.body.userType = APP_CONSTANTS.ACCOUNT_TYPE.EXAMINER;
        const response = await Handler.user.register(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    } catch (error) {
        return universalFunction.errorResponse(res, error)
    }
};

module.exports.login = async (req, res) => {
    try {
        const response = await Handler.user.login(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        return universalFunction.errorResponse(res, error)
    }
};


module.exports.updateProfile = async (req, res) => {
    try {
        let response = await Handler.user.updateProfile(req)
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};