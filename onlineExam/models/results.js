const mongoose = require('mongoose');
const APP_CONSTANTS = require('../constant/App_Constant.js');
const Schema = mongoose.Schema;

const Status  = [
    APP_CONSTANTS.RESULT_STATUS.FAILED,
    APP_CONSTANTS.RESULT_STATUS.PASSED,
    APP_CONSTANTS.RESULT_STATUS.ABSENT
]

const resultModel = new Schema({
    examID: {
        type: Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    totalMarks: {
        type: Number,
        required:true
    },
    marksObtained: {
        type: Number,
        default:0,
        required:true
    },
    status : {
       type : String,
       enum: Status,
       default:Status[2],
       required:true
    },
    percentage:{
        type:Number,
        default:0,
        required:true
    },
    grade:{
        type:String,
        enum:['A','B','C','D','E','F'],
        default:'F',
        required:true
    },
    createdDate: { 
        type: Date, 
        default: new Date() 
    },
	modifiedDate: { 
        type: Date, 
        default: new Date()
    }
});

module.exports = mongoose.model('results', resultModel);