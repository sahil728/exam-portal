const Handler = require('../handlers')
const universalFunction = require('../lib/universal-function')

module.exports.approveOrDeclineExaminer = async (req, res) => {
    try {
        const response = await Handler.admin.approveOrDeclineExaminer(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        throw error;
    }
};



module.exports.getDashboard = async (req, res) => {
    try {
        let response = await Handler.admin.getDashboard(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.getExaminers = async (req, res) => {
    try {
        const response = await Handler.admin.getExaminers(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        return universalFunction.errorResponse(res, error)
    }
};

module.exports.deleteExaminer = async (req, res) => {
    try {
        const response = await Handler.admin.deleteExaminer(req)
        return universalFunction.sendResponse(res, response.status, response.message, response.data)
    }
    catch (error) {
        return universalFunction.errorResponse(res, error)
    }
};