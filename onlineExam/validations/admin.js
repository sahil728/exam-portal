const joi =  require("joi");
const APP_CONSTANTS = require('../constant/App_Constant.js')

const Actions = [
    APP_CONSTANTS.ACCOUNT_STATUS.APPROVED,
    APP_CONSTANTS.ACCOUNT_STATUS.DECLINED
]

module.exports.actionSchema = {
body:joi.object({
    examinerID: joi.string().hex().length(24).required(),
    action: joi.string().valid(...Actions).required()
})
};


module.exports.getExaminerSchema = {
    query: joi.object({

        pageIndex: joi.number().optional(),
        pageSize: joi.number().optional(),
        sortBy: joi.string().optional(),
        order:joi.number().valid(-1,1).optional(),
        search: joi.string().optional(),
        status: joi.string().valid('declined','approved','pending').required()

    })
};

module.exports.profileUpdateSchema = {

    body: joi.object({
        firstName: joi.string().optional(),
        lastName: joi.string().optional(),
        password: joi.string().min(6).optional(),
        mobileNumber: joi.string().min(10).max(12).optional()
    })
    
};

module.exports.deleteSchema={
    params:joi.object({
        examinerID:joi.string().hex().length(24).required()
    })
};
