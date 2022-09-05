const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerModel = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    questionID: {
        type: Schema.Types.ObjectId,
        ref: 'questions',
        required: true
    },
    answer: {
        type: String
    },
    correct: {
        type: Boolean
    },
    isDeleted: {
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('answers', answerModel);