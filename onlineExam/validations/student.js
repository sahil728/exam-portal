const joi = require('joi');

module.exports.getQuestionSchema = {

    query: joi.object({
        pageIndex: joi.number().optional(),
        pageSize: joi.number().optional(),
        studentID: joi.string().hex().length(24).required(),
        examID: joi.string().hex().length(24).required()
    })
    
};

module.exports.accessExamSchema = {

    body: joi.object({
        studentID: joi.string().hex().length(24).required(),
        examID: joi.string().hex().length(24).required(),
        accessCode: joi.string().required()
    })
    
};

module.exports.answerSchema = {

    body: joi.object({
        studentID: joi.string().hex().length(24).required(),
        questionID: joi.string().hex().length(24).required(),
        answer: joi.string().required()
    })
    
};

module.exports.submitExamSchema = {

    body: joi.object({
        studentID: joi.string().hex().length(24).required(),
        examID: joi.string().hex().length(24).required(),
    })
    
};