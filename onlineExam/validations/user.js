const joi = require("joi");


module.exports.userLoginSchema ={
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    })
}


module.exports.userRegistrationSchema = {
    body: joi.object({
        firstName: joi.string().required().error(() => Error('First Name is Not Valid')),
        lastName: joi.string().optional().error(() => Error('Last Name Is Not Valid')),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase().error(() => Error("Email Is Not Valid")),
        mobileNumber: joi.string().min(10).max(12).required().error(() => Error('mobile Number Is Not Valid')),
        password: joi.string().min(6).required().error(() => Error('Password is not valid'))
    })
};



module.exports.profileUpdateSchema = {
    body:joi.object({
        firstName: joi.string().optional(),
        lastName: joi.string().optional(),
        password: joi.string().min(6).optional(),
        mobileNumber: joi.string().min(10).max(12).optional()

    })
};