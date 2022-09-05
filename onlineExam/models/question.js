const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionModel = new Schema({
    examID: {
        type: Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options:{
        type:[String],
        required:true
    },
    correctOption: {
        type: String,
        required:true
    },
    marks: {
        type: Number,
        required:true
    },
    isDeleted:{
        type: Boolean,
        default:false
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

module.exports = mongoose.model('questions', questionModel)