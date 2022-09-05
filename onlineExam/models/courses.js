const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CourseModel = new Schema({

  examinerID: {
    type: Schema.Types.ObjectId,
    ref:'users',
    required: true
  },
  name:{
    type: String,
    required:true
  },
  description: {
    type: String,
    required: true,
    trim: true
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

module.exports = mongoose.model("courses",CourseModel)