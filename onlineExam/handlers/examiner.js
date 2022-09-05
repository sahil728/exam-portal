const mongoose = require("mongoose");
const APP_CONSTANTS = require('../constant/App_Constant.js');
const Model = require("../models");
const statusCodeList = require('../statusCode/statusCode.js');
const statusCodes = statusCodeList.STATUS_CODE;
const messageList = require('../messages/messages.js');
const universalFunction = require('../lib/universal-function.js');
const messages = messageList.MESSAGES;

module.exports.getDashboard = async (req) => {
  try {
    let examiner = req.loggedUser;
    let courses = await Model.courses.find({
      examinerID: examiner._id,
      isDeleted: false
    });
    return {
      status: statusCodes.SUCCESS,
      message: messages.DASHBOARD_LOADED_SUCCESSFULLY,
      data: {
        examinerDetails: examiner,
        examinerCourses: courses
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports.createCourse = async (req) => {
  try {
    let payload = req.body;
    let existingCourse = await Model.courses.findOne({
      name: payload.name,
      examinerID: payload.examinerID,
      isDeleted: false
    });

    if (existingCourse) {
      return {
        status: statusCodes.UNPROCESSABLE_ENTITY,
        message: messages.COURSE_ALREADY_EXIST
      }
    };

    let course = await Model.courses.create(payload)
    return {
      status: statusCodes.CREATED,
      message: messages.COURSE_REGISTERED_SUCCESSFULLY,
      data: {
        course: course
      }
    };
  }
  catch (error) {
    throw error;
  }
};

module.exports.addSubjects = async (req) => {
  try {
    let payload = req.body.subjects;
    for (let i in payload) {
      if ((payload.findIndex((e) => e.name == payload[i].name) != i)) {
        return {
          status: statusCodes.DUPLICATE,
          message: messages.DUPLICATE_ENTRY
        }
      };
      let course = await Model.courses.findById(payload[i].courseID);

      if (!course && course.isDeleted) {
        return {
          status: statusCodes.NOT_FOUND,
          message: messages.COURSE_NOT_FOUND
        }
      };

      let existingSubject = await Model.subjects.findOne({
        name: payload[i].name,
        courseID: payload[i].courseID,
        isDeleted: false
      });
      if (existingSubject) {
        return {
          status: statusCodes.UNPROCESSABLE_ENTITY,
          message: messages.SUBJECT_ALREADY_EXIST
        }
      };
      let subjects = await Model.subjects.insertMany(payload);
      return {
        status: statusCodes.CREATED,
        message: messages.SUBJECT_REGISTERED_SUCCESSFULLY,
        data: {
          subjects: subjects
        }
      };
    };
  }
  catch (error) {
    throw error;
  }
};

module.exports.getSubjects = async (req) => {
  try {
    let payload = req.query;
    let limit = payload.pageSize ? payload.pageSize : 5;
    let skip = payload.pageIndex ? payload.pageIndex * limit : 0;
    let count = await Model.subjects.countDocuments({
      courseID: payload.courseID,
      isDeleted: false
    });

    let course = await Model.courses.findById(payload.courseID);
    if (!course || course.examinerID != payload.examinerID || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    };
    let subjects = await Model.courses.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(payload.courseID),
          isDeleted: false
        }
      },
      { 
        $lookup: {
          from: "subjects",
          let: {
            courseID: "$_id" // this is from course table
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    isDeleted: false
                  },
                  {
                    $expr: {
                      $eq: ['$$courseID', '$courseID']  // $$courseID from course table $courseID from subj table
                    }
                  }]
              }
            }],
          as: "subjects"
        }
      },
      {
        $unwind: "$subjects"
      },
      {
        $project: {
          subjectName: "$subjects.name",
          subjectID: "$subjects._id",
          subjectCourse: "$name",
          examinerID: "$examinerID"
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    return {
      status: statusCodes.SUCCESS,
      message: messages.SUBJECTS_LOADED_SUCCESSFULLY,
      data: {
        totalPages: Math.ceil(count / limit),
        subjects: subjects
      }
    }
  }
  catch (error) {
    throw error;
  }
};



module.exports.createStudent = async (req) => {
  try {
    let payload = req.body;
    let course = await Model.courses.findById(payload.courseID);

    if (!course || course.examinerID != payload.examinerID || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    };

    let password = await universalFunction.hashPasswordUsingBcrypt(payload.password);
    payload.password = password;

    let existingUser = await Model.users.findOne({
      email: payload.email
    })

    if (existingUser) {
      return {
        status: statusCodes.UNPROCESSABLE_ENTITY,
        message: messages.EMAIL_ALREADY_TAKEN
      }
    };

    let user = await Model.users.create(payload)

    payload.userID = user._id;
    let student = await Model.students.create(payload);

    return {
      status: statusCodes.CREATED,
      message: messages.STUDENT_REGISTERED_SUCCESSFULLY,
      data: {
        student: student
      }
    }

  } catch (error) {
    throw error;

  }
};

module.exports.addStudent = async (req) => {

  try {
    let payload = req.body;
    let course = await Model.courses.findById(payload.courseID);
    if (!course || course.examinerID != payload.examinerID || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    };

    let user = await Model.users.findById(payload.studentID);
    if (!user || user.userType != APP_CONSTANTS.ACCOUNT_TYPE.STUDENT) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.STUDENT_NOT_FOUND
      }
    };

    let existingStudent = await Model.students.findOne({
      courseID: payload.courseID,
      userID: user._id,
      isDeleted: false
    });

    if (existingStudent) {
      return {
        status: statusCodes.UNPROCESSABLE_ENTITY,
        message: messages.STUDENT_REGISTERED_SUCCESSFULLY

      }
    };

    let { motherName, fatherName, dob, gender, address, city, state, userID } = await Model.students.findOne({ userID: user._id })
    let student = await Model.students.create({ motherName, fatherName, dob, gender, address, city, state, userID, courseID: payload.courseID })
    return {
      status: statusCodes.CREATED,
      message: messages.STUDENT_REGISTERED_SUCCESSFULLY,
      data: {
        student: student
      }
    }
  } catch (error) {
    throw error;
  }
};



module.exports.createExam = async (req, res) => {
  try {
    let payload = req.body;
    let subject = await Model.subjects.findById(payload.subjectID)

    let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
    let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
    let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
    if (!subject || subject.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.SUBJECT_NOT_FOUND
      }
    };

    let course = await Model.courses.findById(subject.courseID);
    if (!course || course.examinerID != payload.examinerID || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.SUBJECT_NOT_FOUND
      }
    };

    if (((payload.examDate.getTime() + startTime <= Date.now()))) {
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
      }
    };

    if (!duration || endTime - startTime < duration) {
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAM_DURATION_MUST_BE_CORRECT
      }
    };

    payload.totalMarks = parseInt(payload.questions.map((e) => e.marks).reduce((a, b) => a + b));
    payload.passingMarks = parseInt((35 / 100) * payload.totalMarks);

    let exam = new Model.exams(payload);

    payload.students = payload.students.filter((e, i, arr) => arr.indexOf(e) === i);


    for (let element of payload.students) {
      let student = await Model.students.findOne({ _id: mongoose.Types.ObjectId(element), courseID: course._id, isDeleted: false });
      if (!student) return {
        status: statusCodes.NOT_FOUND,
        message: messages.STUDENT_NOT_FOUND
      }
      let user = await Model.users.findById(mongoose.Types.ObjectId(student.userID));
      await Model.examstudents.create({
        examID: exam._id,
        studentID: student._id,
        subjectID: subject._id,
        examinerID: payload.examinerID
      });
      let data = {
        email: user.email,
        subject: subject.name,
        course: course.name,
        accessCode: payload.accessCode
      }
      // mailer.sendExamMail(data);
    };

    for (let i in payload.questions) {
      let question = payload.questions[i];
      await Model.questions.create({ ...question, examID: exam._id });
    };

    await exam.save();

    return {
      status: statusCodes.CREATED,
      message: messages.EXAM_CREATED_SUCCESSFULLY
    }


  } catch (error) {
    throw error;
  }
};

module.exports.removeExamStudent = async (req) => {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      isDeleted: true
    };

    let examStudent = await Model.examstudents.findOne({ examID: payload.examID, studentID: payload.studentID })
    let student = await Model.students.findById(payload.studentID)
    let exam = await Model.exams.findById(payload.examID)
    if (!student || student.isDeleted || !examStudent) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.STUDENT_NOT_FOUND
      }
    };
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      }
    };

    await Model.examstudents.findByIdAndUpdate(examStudent._id, fieldsToUpdate)

    return {
      status: statusCodes.SUCCESS,
      message: messages.STUDENT_REMOVED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.getStudents = async (req) => {
  try {
    let payload = req.query;
    let limit = payload.pageSize ? payload.pageSize : 5;
    let skip = payload.pageIndex ? payload.pageIndex * limit : 0;

    let count = await Model.students.countDocuments({
      courseID: payload.courseID,
      isDeleted: false
    });

    let course = await Model.courses.findById(payload.courseID);

    if (!course || course.examinerID != payload.examinerID || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    };

    let students = await Model.students.aggregate([
      {
        $match: {
          courseID: mongoose.Types.ObjectId(payload.courseID),
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseID",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "details"
        }
      },
      {
        $unwind: "$details"
      },
      {
        $unwind: "$course"
      },
      {
        $project: {
          dob: "$dob",
          gender: "$gender",
          address: "$address",
          course: "$course.name",
          email: "$details.email",
          motherName: "$motherName",
          fatherName: "$fatherName",
          studentName: { $concat: ["$details.firstName", " ", "$details.lastName"] },
          userID: "$details._id",
          mobilenumber: "$details.mobileNumber"
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return {
      status: statusCodes.SUCCESS,
      message: messages.STUDENT_LIST_LOADED_SUCCESSFULLY,
      data: {
        totalPages: Math.ceil(count / limit),
        students: students
      }
    };

  }
  catch (error) {
    throw error;
  }
};

module.exports.updateCourse = async (req) => {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      modifiedDate: new Date(),
      ...payload
    };

    let course = await Model.courses.findById(payload.courseID)
    if (!course || course.examinerID != examiner.id || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    };

    await Model.courses.findByIdAndUpdate(course._id, fieldsToUpdate, { upsert: false });
    return {
      status: statusCodes.SUCCESS,
      message: messages.COURSE_UPDATED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.deleteCourse = async (req) => {
  try {
    let payload = req.params;
    let examiner = req.loggedUser;
    let fieldsToUpdate = { isDeleted: true };
    let course = await Model.courses.findById(payload.courseID);
    if (!course || course.examinerID != examiner.id)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }

    let subject = await Model.subjects.findOne({ courseID: course._id, isDeleted: false });
    if (subject) {
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.SUBJECTS_EXISTS_IN_THIS_COURSE
      }
    }

    await Model.courses.findByIdAndUpdate(course._id, fieldsToUpdate);
    return {
      status: statusCodes.SUCCESS,
      message: messages.COURSE_DELETED_SUCCESSFULLY
    }
  }
  catch (error) {
    throw error;
  }
};

module.exports.updateSubject = async (req) => {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      modifiedDate: new Date(),
      ...payload
    };
    let subject = await Model.subjects.findById(payload.subjectID);
    if (!subject || subject.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.SUBJECT_NOT_FOUND
      }
    let course = await Model.courses.findById(subject.courseID);
    if (!course || course.examinerID != examiner.id || course.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    await Model.subjects.findByIdAndUpdate(subject._id, fieldsToUpdate, { upsert: false });
    return {
      status: statusCodes.SUCCESS,
      message: messages.SUBJECT_UPDATED_SUCCESSFULLY
    }
  }
  catch (error) {
    throw error;
  }
};

module.exports.deleteSubject = async (req) => {
  try {
    let payload = req.params;
    let examiner = req.loggedUser;
    let fieldsToUpdate = { isDeleted: true };

    let subject = await Model.subjects.findById(payload.subjectID);
    if (!subject) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.SUBJECT_NOT_FOUND
      }
    }

    let course = await Model.courses.findById(subject.courseID);
    if (!course || course.examinerID != examiner.id || course.isDeleted) {
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    }

    await Model.subjects.findByIdAndUpdate(subject._id, fieldsToUpdate);

    return {
      status: statusCodes.SUCCESS,
      message: messages.SUBJECT_DELETED_SUCCESSFULLY
    }

  }
  catch (error) {
    throw error;
  }
};

module.exports.getAllStudents = async (req) => {
  try {
    let payload = req.query;
    let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
    let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;

    
    let count = await Model.users.countDocuments(
      {
        userType: APP_CONSTANTS.ACCOUNT_TYPE.STUDENT,
        status: APP_CONSTANTS.ACCOUNT_STATUS.APPROVED
      });

    let students = await Model.users.find({
      userType: APP_CONSTANTS.ACCOUNT_TYPE.STUDENT,
      status: APP_CONSTANTS.ACCOUNT_STATUS.APPROVED
    },
      {
        password: 0
      })
      .skip(skip)
      .limit(limit);

    return {
      status: statusCodes.SUCCESS,
      message: messages.STUDENT_LIST_LOADED_SUCCESSFULLY,
      data: {
        totalPages: Math.ceil(count / limit),
        students: students
      }
    };
  }
  catch (error) {
    throw error;
  }
};

module.exports.deleteStudent = async (req) => {
  try {
    let payload = req.params;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      isDeleted: true
    };

    let student = await Model.students.findById(payload.studentID);
    if (!student) return {
      status: statusCodes.NOT_FOUND,
      message: messages.STUDENT_NOT_FOUND
    }

    let course = await Model.courses.findById(student.courseID);
    if (!course || course.examinerID != examiner.id)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    await Model.students.findByIdAndUpdate(payload.studentID, fieldsToUpdate);
    await Model.examstudents.updateMany({ studentID: student._id }, fieldsToUpdate);
    return {
      status: statusCodes.SUCCESS,
      message: messages.STUDENT_DELETED_SUCCESSFULLY 
    }

  } catch (error) {
    throw error;
  }
};


module.exports.getExams = async (req) => {
  try {
    let payload = req.query;
    let examiner = req.loggedUser;
    let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
    let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;

    let count = await Model.exams.countDocuments({
      examinerID: examiner._id,
      isDeleted: false
    });

    let exams = await Model.exams.aggregate([
      {
        $match: {
          examinerID: mongoose.Types.ObjectId(examiner._id), // 
          isDeleted: false

        }
      },
       {
        $lookup: {
          from: "subjects",  // from subject table
          localField: "subjectID", // this subj id from exam table
          foreignField: "_id",   // this is from subject table
          as: "subject"
        }
      },
      {
        $lookup: {
          from: "examstudents",  // now get exam std.
          let: {
            examID: "$_id"  // this _id of exam table
          },
          pipeline: [
            {
              $match: {
                isDeleted: false, // this from examstd table
                $expr: {
                  $eq: ["$$examID", "$examID"] //  equql $$examId above and $examid from examstd table
                } 
              }
            },
            {
              $lookup: {
                from: "students",
                let: {
                  studentID: "$studentID"  // this is from exmstd table
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$studentID", "$_id"] // $$ stdid from examstd table $_id from std table
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      let: {
                        userID: "$userID"  // this is from std table
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$$userID", "$_id"] // this $$userID as above and $_id from user table
                            }
                          }
                        },
                        {
                          $project: {     // this is from user table
                            firstName: "$firstName",
                            lastName: "$lastName",
                            email: "$email",
                            mobileNumber: "$mobileNumber"
                          }
                        }
                      ],
                      as: "user"
                    }
                  },
                  {
                    $unwind: "$user"
                  },
                  {
                    $project: {  // this from std table
                      name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
                      email: "$user.email",
                      mobileNumber: "$user.mobileNumber"
                    }
                  }
                ],
                as: "student"
              }
            },
            {
              $unwind: "$student"
            },
            { 
              $project: { // this is from exam std
                _id: 0,
                studentName: "$student.name",
                email: "$student.email",
                mobileNumber: "$student.mobileNumber",
                studentID: "$studentID",
                status: "$status"
              }
            }
          ],
          as: "students"
        }
      },
      {
        $lookup: {
          from: "questions",
          let: {
            examID: "$_id"  // this is from exam table
          },
          pipeline: [
            {
              $match: {
                isDeleted: false,  // this isfrom question table
                $expr: {
                  $eq: ["$$examID", "$examID"]  // $$examID as above and $examID from question table
                }
              }
            },
            {
              $project: {  // this is from question table
                question: "$question",
                marks: "$marks",
                options: "$options",
                correctOption: "$correctOption"
              }
            }
          ],
          as: "questions"
        }
      },
      {
        $unwind: "$subject"
      },
      { 
        $lookup: {  
          from: "courses",  // get course detail from course table
          localField: "subject.courseID", // this get from unwind subject.courseId
          foreignField: "_id", // this from course table
          as: "course"
        }
      },
      {
        $unwind: "$course"
      },
      {
        $sort: {
          createdDate: -1,  
          modifiedDate: -1
        }
      },
      {
        $project: { // this of exam project
          _id: 0,
          course: "$course.name",
          subject: "$subject.name",
          examID: "$_id",
          startTime: "$startTime",
          endTime: "$endTime",
          totalMarks: "$totalMarks",
          passingMarks: "$passingMarks",
          examDate: "$examDate",
          duration: "$duration",
          questions: "$questions",
          students: "$students"
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ])
    return {
      status: statusCodes.SUCCESS,
      message: messages.EXAM_LOADED_SUCCESSFULLY,
      data: {
        totalPages: Math.ceil(count / limit),
        exams: exams
      }
    }
  } catch (error) {
    throw error;
  }
};

module.exports.updateExam = async(req)=>{
  try{
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      modifiedDate: new Date(),
      ...payload
    };
    let exam = await Model.exams.findById(payload.examID);
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      }
    let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
    if ((exam.examDate.getTime() + startTime <= Date.now()))
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAMINER_CANNOT_UPDATE_EXAM_ON_EXAMDATE
      };
    // checking valid entries for exam startTime , endTime , duration & examdate
    if (payload.examDate && payload.startTime && payload.endTime && payload.duration) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.startTime && payload.endTime) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.startTime && payload.duration) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.endTime && payload.duration) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.startTime && payload.endTime && payload.duration) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.startTime) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.endTime) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate && payload.duration) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.startTime && payload.endTime) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.startTime && payload.duration) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.endTime && payload.duration) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.examDate) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((payload.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.startTime) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(payload.startTime.split(":")[0] * 3600000) + parseInt(payload.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.endTime) {
      let endTime = parseInt(payload.endTime.split(":")[0] * 3600000) + parseInt(payload.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(exam.duration.split(":")[0]) * 3600000) + (parseInt(exam.duration.split(":")[1]) ? parseInt(exam.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }
    else if (payload.duration) {
      let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
      let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
      let duration = (parseInt(payload.duration.split(":")[0]) * 3600000) + (parseInt(payload.duration.split(":")[1]) ? parseInt(payload.duration.split(":")[1]) * 60000 : 0);
      if ((exam.examDate.getTime() + startTime <= Date.now()))
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DATE_MUST_GREATER_THAN_NOW
        };
      if (!duration || endTime - startTime < duration)
        return {
          status: statusCodes.BAD_REQUEST,
          message: messages.EXAM_DURATION_MUST_BE_CORRECT
        };
    }

    await Model.exams.findByIdAndUpdate(exam._id, fieldsToUpdate, { upsert: false });
    return {
      status: statusCodes.SUCCESS,
      message: messages.EXAM_UPDATED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.updateQuestion = async function (req) {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      modifiedDate: new Date(),
      ...payload
    };
    let question = await Model.questions.findById(payload.questionID);
    if (!question || question.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.QUESTION_NOT_FOUND
      }
    let exam = await Model.exams.findById(question.examID);
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      }
    let startTime = parseInt(exam.startTime.split(":")[0] * 3600000) + parseInt(exam.startTime.split(":")[1] * 60000);
    if ((exam.examDate.getTime() + startTime <= Date.now()))
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAMINER_CANNOT_UPDATE_QUESTION_ON_EXAMDATE
      };
    exam.totalMarks -= question.marks;
    exam.totalMarks += payload.marks;
    exam.passingMarks = parseInt((35 / 100) * exam.totalMarks);
    await Model.exams.findByIdAndUpdate(exam._id, exam, { upsert: false });
    await Model.questions.findByIdAndUpdate(question._id, fieldsToUpdate, { upsert: false });
    return {
      status: statusCodes.SUCCESS,
      message: messages.QUESTION_UPDATED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.updateSubject = async function (req) {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      modifiedDate: new Date(),
      ...payload
    };
    let subject = await Model.subjects.findById(payload.subjectID);
    if (!subject || subject.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.SUBJECT_NOT_FOUND
      }
    let course = await Model.courses.findById(subject.courseID);
    if (!course || course.examinerID != examiner.id || course.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.COURSE_NOT_FOUND
      }
    await Model.subjects.findByIdAndUpdate(subject._id, fieldsToUpdate, { upsert: false });
    return {
      status: statusCodes.SUCCESS,
      message: messages.SUBJECT_UPDATED_SUCCESSFULLY
    }


  }catch(error){
    throw error;
  }
};

module.exports.deleteExam = async function (req) {
  try {
    let payload = req.params;
    let examiner = req.loggedUser;
    let fieldsToUpdate = {
      isDeleted: true
    };
    let exam = await Model.exams.findById(payload.examID);
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      }
    if ((exam.examDate.getTime() + (exam.startTime.split(":")[0] * 3600000) + (exam.startTime.split(":")[1] * 60000) <= Date.now()))
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAMINER_CANNOT_DELETED_EXAM_ON_EXAMDATE
      };

    await Model.exams.findByIdAndUpdate(exam._id, fieldsToUpdate);
    await Model.questions.updateMany({ examID: exam._id }, fieldsToUpdate);
    await Model.examstudents.updateMany({ examID: exam._id }, fieldsToUpdate);
    return {
      status: statusCodes.SUCCESS,
      message: messages.EXAM_DELETED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.declareResult = async function (req) {
  try {
    let payload = req.body;
    let examiner = req.loggedUser;

    let exam = await Model.exams.findById(payload.examID);
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      } 
    let endTime = parseInt(exam.endTime.split(":")[0] * 3600000) + parseInt(exam.endTime.split(":")[1] * 60000);
    if ((exam.examDate.getTime() + endTime >= Date.now() + 5 * 3600000 + 1800000))
      return {
        status: statusCodes.BAD_REQUEST,
        message: messages.EXAM_RESULT_MUST_DECLARE_AFTER_EXAM_TIME_OVER
      };
    let alreadyDeclared = await Model.results.findOne({ examID: exam._id });
    if (alreadyDeclared) return {
      status: statusCodes.DUPLICATE,
      message: messages.RESULT_ALREADY_DECLARED
    }

    let result = await Model.examstudents.aggregate([
      {
        $match: {
          examID: exam._id,
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'questions',
          let: {
            studentID: "$studentID",
          },
          pipeline: [
            {
              $match: {
                examID: exam._id,
                isDeleted: false
              }
            },
            {
              $lookup: {
                from: "answers",
                let: {
                  questionID: "$_id",
                  studentID: "$$studentID"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$questionID", "$$questionID"] }, { $eq: ["$studentID", "$$studentID"] }]
                      },
                      isDeleted: false
                    }
                  }
                ],
                as: 'answer'
              }
            },
            {
              $unwind: {
                "path": "$answer",
                "preserveNullAndEmptyArrays": true
              }
            },
            {
              $group: {
                _id: '$examID',
                marksObtained: {
                  $sum: {
                    $cond: { if: "$answer.correct", then: "$marks", else: 0 }
                  }
                },
                totalMarks: {
                  $sum: "$marks"
                }
              }
            }
          ],
          as: "result"
        }
      },
      {
        $unwind: "$result"
      },
      {
        $project: {
          _id: 0,
          examID: 1,
          studentID: 1,
          marksObtained: "$result.marksObtained",
          totalMarks: "$result.totalMarks",
          percentage: { $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] },
          grade: {
            $switch: {
              branches: [
                { case: { $gte: [{ $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] }, 90] }, then: "A" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] }, 80] }, then: "B" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] }, 70] }, then: "C" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] }, 60] }, then: "D" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$result.marksObtained", "$result.totalMarks"] }, 100] }, 40] }, then: "E" }
              ],
              default: 'F'
            }
          },
          status: { $cond: [{ $eq: ["$status", APP_CONSTANTS.DURATION_STATUS.NOT_STARTED] }, APP_CONSTANTS.RESULT_STATUS.ABSENT, { $cond: { if: { $gt: ["$result.marksObtained", exam.passingMarks] }, then: APP_CONSTANTS.RESULT_STATUS.PASSED, else: APP_CONSTANTS.RESULT_STATUS.FAILED } }] },
        }
      }
    ]);

    await Model.results.insertMany(result);
    return {
      status: statusCodes.SUCCESS,
      message: messages.RESULT_DECLARED_SUCCESSFULLY
    }
  } catch (error) {
    throw error;
  }
};

module.exports.getResult = async function (req) {
  try {
    let payload = req.query;
    let examiner = req.loggedUser;
    let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
    let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;
    let exam = await Model.exams.findById(payload.examID);
    if (!exam || exam.examinerID != examiner.id || exam.isDeleted)
      return {
        status: statusCodes.NOT_FOUND,
        message: messages.EXAM_NOT_FOUND
      }

    let result = await Model.results.aggregate([
      {
        $match: {
          examID: exam._id
        }
      },
      {
        $lookup: {
          from: "examstudents",
          let: {
            studentID: "$studentID",
            examID: "$examID"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$studentID", "$$studentID"] }, { $eq: ["$examID", "$$examID"] }]
                }
              }
            },
            {
              $lookup: {
                from: "subjects",
                let: {
                  subjectID: "$subjectID"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$subjectID", "$_id"]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "courses",
                      localField: "courseID",
                      foreignField: "_id",
                      as: "course"
                    }
                  },
                  {
                    $unwind: "$course"
                  }
                ],
                as: "subject"
              }
            },
            {
              $unwind: "$subject"
            },
            {
              $lookup: {
                from: "students",
                let: {
                  studentID: "$studentID"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$studentID", "$_id"]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "userID",
                      foreignField: "_id",
                      as: "user"
                    }
                  },
                  {
                    $unwind: "$user"
                  }
                ],
                as: "student"
              }
            },
            {
              $lookup: {
                from: "exams",
                let: {
                  examID: "$examID"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$examID", "$_id"]
                      },
                      isDeleted: false
                    }
                  }
                ],
                as: "exam"
              }
            },
            {
              $unwind: "$student"
            },
            {
              $unwind: "$exam"
            },
            {
              $project: {
                subject: "$subject.name",
                course: "$subject.course.name",
                examDate: "$exam.examDate",
                studentName:{$concat:["$student.user.firstName"," ","$student.user.lastName"]},
                studentEmail: "$student.user.email",
                studentContact: "$student.user.mobileNumber"
              }
            }
          ],
          as: "result"
        }
      },
      {
        $unwind: "$result"
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          declaredON: "$modifiedDate",
          studentID: "$studentID",
          examID: "$examID",
          examDate: "$result.examDate",
          studentName: "$result.studentName",
          studentEmail: "$result.studentEmail",
          studentContact: "$result.studentContact",
          subject: "$result.subject",
          course: "$result.course",
          marksObtained: "$marksObtained",
          totalMarks: "$totalMarks",
          status: "$status",
          percentage: "$percentage",
          grade: "$grade"
        }
      }
    ]);
    return {
      status: statusCodes.SUCCESS,
      message: messages.RESULTS_LOADED_SUCCESSFULLY,
      data: {
        results: result
      }
    }

  } catch (error) {
    throw error;
  }
};