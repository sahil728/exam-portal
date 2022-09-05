const Handler = require('../handlers');
const universalFunction = require('../lib/universal-function');

module.exports.getDashboard = async (req, res) => {
    try {
        const response = await Handler.student.getDashboard(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)

    }
    catch (error) {
        return (res, errorResponse)
    }
};

module.exports.getExams = async (req, res) => {
    try {
        const response = await Handler.student.getExams(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data)

    } catch (error) {
        return universalFunction.errorResponse(res,error)
    }
};

module.exports.getExamRecords = async function (req,res) {
    try {
        const response = await Handler.student.getExamRecords(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data);
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};


module.exports.getResult = async function (req,res) {
    try{
        const response = await Handler.student.getResults(req);
        return universalFunction.sendResponse(res,response.status,response.message,response.data);
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};


module.exports.getQuestions = async function (req,res) {
    try {
        const response = await Handler.student.getQuestions(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data);
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.accessExam = async function (req,res) {
    try {
        const response = await Handler.student.accessExam(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data);
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.submitAnswer = async function (req,res) {
    try{
        const response = await Handler.student.submitAnswer(req);
        return universalFunction.sendResponse(res,response.status,response.message,response.data);
    }
    catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.submitExam = async function (req,res) {
    try{
        const response = await Handler.student.submitExam(req);
        return universalFunction.sendResponse(res,response.status,response.message,response.data);
    }
    catch (error) {

        return universalFunction.errorResponse(res, error);

    }

}
