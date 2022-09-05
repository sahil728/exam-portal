const mongoose = require('mongoose');
const APP_CONSTANTS = require('../constant/App_Constant');

const gender = [
    APP_CONSTANTS.STUDENT_GENDER.FEMALE,
    APP_CONSTANTS.STUDENT_GENDER.MALE,
    APP_CONSTANTS.STUDENT_GENDER.OTHER
]

const Schema = mongoose.Schema;
const StudentModel = new Schema({
    userID:{
        type: Schema.Types.ObjectId,
        ref:'users',
		required: true
    },
    fatherName: { 
        type: String, 
        required: true 
    },
	motherName: { 
        type: String, 
        required: true 
    },
    dob: { 
        type: String,
        required: true 
    },
	address: { 
        type: String, 
        required: true 
    },
	city: { 
        type: String, 
        required: true 
    },
	state: { 
        type: String, 
        required: true 
    },
    gender: { 
        type: String,
        enum: gender,
        required: true
    },
    courseID: {
        type:Schema.Types.ObjectId,
        ref:'courses',
		required: true
    },
    isDeleted: {
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('students',StudentModel);