const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SubjectModel = new Schema({
    courseID: {
        type: Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    }, name: {
        type: String,
        required: true  
    },
    isDeleted: {
        type:Boolean,
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

module.exports= mongoose.model('subjects', SubjectModel)