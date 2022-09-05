const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require('../config/config.js');
const statusCodeList = require('../statusCode/statusCode.js');
const messageList = require("../messages/messages.js");
const statusCode = statusCodeList.STATUS_CODE;
const messages = messageList.MESSAGES;

const sendResponse = async (res, code, message, data) =>{
    code = code || statusCode.SUCCESS;
    message = message || messages.SUCCESS;
    data = data || {};
    return res.status(code).send({
        statusCode:code,
        message:message,
        data:data
    });
};

const forBiddenResponse = async (res, message) => {
	const code = statusCode.FORBIDDEN;
	message = message || messages.FORBIDDEN;
	return res.status(code).send({
		statusCode: code,
		message: message
	});
};

const unauthorizedResponse = async (res, message) => {
	const code = statusCode.UNAUTHORIZED;
	message = message || messages.UNAUTHORIZED;
	return res.status(code).send({
		statusCode: code,
		message: message
	});
};

const errorResponse = async(res,error) =>{
    const code = statusCode.INTERNAL_SERVER_ERROR
    console.log(error.stack);
    return res.status(code).send({
        statusCode:code,
        message:messages.SERVER_ERROR
    });
};

const validationError = async (res, error) => {
	const code = statusCode.UNPROCESSABLE_ENTITY;
	return res.status(code).send({
		statusCode: code,
		message:error.message.replace(new RegExp('\\"',"g"),"") 
	});
};

const hashPasswordUsingBcrypt = async (plainTextPassword)=>{
const saltRound = 10;
return bcrypt.hashSync(plainTextPassword,saltRound);
};

const jwtSign = async(payload) =>{
    return jwt.sign({_id:payload._id}, config.JWTSECRETKEY, {expiresIn:"1d"})
};

const jwtVerify = async(token) =>{
    return jwt.verify(token, config.JWTSECRETKEY)
};

const comparePasswordUsingBcrypt = async (plainTextPassword, hashedPassword) => {
	return bcrypt.compareSync(plainTextPassword, hashedPassword);
};



module.exports = {
    hashPasswordUsingBcrypt:hashPasswordUsingBcrypt,
    jwtSign:jwtSign,
    jwtVerify:jwtVerify,
    comparePasswordUsingBcrypt:comparePasswordUsingBcrypt,
    sendResponse:sendResponse,
    errorResponse:errorResponse,
    validationError:validationError,
    forBiddenResponse:forBiddenResponse,
    unauthorizedResponse:unauthorizedResponse
}