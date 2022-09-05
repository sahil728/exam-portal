const mongoose = require('mongoose');
const users = require('../models/user.js');
const universalFunction = require('../lib/universal-function.js');
const messageList = require('../messages/messages');
const APP_CONSTANTS = require('../constant/App_Constant.js');
const message = messageList.MESSAGES;

module.exports = function (userType) {
    return async (req, res, next) => {
        try {
            if (req.headers.authorization) {
                let accessToken = req.headers.authorization;

                if (accessToken.startsWith('Bearer')) {
                    [, accessToken] = accessToken.split(' ');
                };

                const decodedData = await universalFunction.jwtVerify(accessToken)
                let userData = await users.findById(decodedData._id, { password: 0 })
                if (userData) {
                    if (userData.status != APP_CONSTANTS.ACCOUNT_STATUS.APPROVED) {
                        return universalFunction.forBiddenResponse(res, message.USER_NOT_ALLOWDED_TO_LOGIN)
                    }
                    else if (userData.userType === userType) {
                        req.loggedUser = userData;
                        next();
                    }
                    else {
                        return universalFunction.forBiddenResponse(res, message.USER_NOT_ALLOWDED_TO_ACCESS_THIS_PAGE)
                    }
                }
            }
            else {
                return universalFunction.unauthorizedResponse(res, message.UNAUTHORIZED)
            }
        }
        catch (error) {
            return universalFunction.forBiddenResponse(res, message.INVALID_TOKEN)
        }
    }
}