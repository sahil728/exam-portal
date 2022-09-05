const APP_CONSTANTS = require('../constant/App_Constant')
const universalFunction = require("../lib/universal-function");
const users = require("../models/user.js")
const { connect } = require("../db/connection");

async function createAdmin() {
    await connect();
    let firstName = "Admin";
    let lastName = "Account";
    let hastPassword = await universalFunction.hashPasswordUsingBcrypt("123456");
    await users.create({
        firstName: firstName,
        lastName: lastName,
        email: "admin@gmail.com",
        password: hastPassword,
        mobileNumber: '987654321',
        userType: APP_CONSTANTS.ACCOUNT_TYPE.ADMIN,
        status: APP_CONSTANTS.ACCOUNT_STATUS.APPROVED
    });
    console.log("Admin Created");
}
createAdmin();

