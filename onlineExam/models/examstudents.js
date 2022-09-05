const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const APP_CONSTANTS = require('../constant/App_Constant.js');

const Status = [
    APP_CONSTANTS.DURATION_STATUS.ACTIVE,
    APP_CONSTANTS.DURATION_STATUS.NOT_STARTED,
    APP_CONSTANTS.DURATION_STATUS.OVER
];

const examStudentsModel = new Schema({
    subjectID: {
        type: Schema.Types.ObjectId,
        ref: 'subjects',
        required: true
    },
    examID:{
        type: Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    examinerID: {
        type: Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    status: {
        type: String,
        enum: Status,
        default:Status[1],
        required:true
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('examstudents', examStudentsModel);