const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const examModel = new Schema({
    subjectID: {
        type: Schema.Types.ObjectId,
        ref: 'subjects',
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
     endTime: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    accessCode: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    examinerID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model('exams', examModel);