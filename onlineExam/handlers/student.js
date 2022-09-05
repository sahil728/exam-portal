const mongoose = require('mongoose');
const  APP_CONSTANTS = require('../constant/App_Constant');
const Model = require('../models');
const statusCodeList = require('../statusCode/statusCode.js');
const statusCodes = statusCodeList.STATUS_CODE;
const messageList = require('../messages/messages.js');
const messages = messageList.MESSAGES;
const [date,] = new Date(Date.now() + (5 * 3600000 + 1800000)).toISOString().split('T');


module.exports.getDashboard = async(req)=>{
    try{
    let user = req.loggedUser;
    let student = await Model.students.aggregate([
        {
            $match: { userID: mongoose.Types.ObjectId(user._id), isDeleted: false }
        },
        {
            $lookup: {
                from: "users",
                localField: "userID",
                foreignField: "_id",
                as: 'user'
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseID",
                foreignField: "_id",
                as: 'course'
            }
        },
        {
            $unwind: "$course"
        },
        {
            $unwind: "$user"
        },
        {
            $group: {
                _id: "$userID",
                firstName: { $first: "$user.firstName" },
                lastName: { $first: "$user.lastName" },
                email: { $first: "$user.email" },
                dob: { $first: "$dob" },
                fatherName: { $first: "$fatherName" },
                motherName: { $first: "$motherName" },
                address: { $first: "$address" },
                city: { $first: "$city" },
                state: { $first: "$state" },
                gender: { $first: "$gender" },
                courses: { $push: "$course.name" }
            }
        },
        {
            $project: {
                studentID: 0
            }
        }
    ]);

    return {
        status: statusCodes.SUCCESS,
        message: messages.DASHBOARD_LOADED_SUCCESSFULLY,
        data: {
            student: student[0]
        }
    }
}

catch (error) {

    throw error;

}
};


module.exports.getExams = async(req)=>{
    try {
        let user = req.loggedUser;
        let payload = req.query;
        let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
        let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;

        let studentexams = await Model.students.aggregate([
            {
                $match: { userID: mongoose.Types.ObjectId(user._id), isDeleted: false }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: 'user'
                }
            },
            {
                $unwind: "$user"
            },
            {
                $group: {
                    _id: "$userID",
                    studentID: { $push: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "examstudents",
                    let: {
                        studentID: "$studentID"
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $in: ["$studentID", "$$studentID"]
                                }
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
                                            examDate: {
                                                $gte: new Date(date)
                                            },
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
                            $unwind: "$exam"
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
                            $project: {
                                _id: 0,
                                examID: 1,
                                studentID: 1,
                                subject: "$subject.name",
                                course: "$subject.course.name",
                                totalMarks: "$exam.totalMarks",
                                startTime: "$exam.startTime",
                                endTime: "$exam.endTime",
                                duration: "$exam.duration",
                                examDate: "$exam.examDate"
                            }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        }
                    ],
                    as: "studentexams"
                }
            },
            {
                $project: {
                    studentexams: 1,
                    _id: 0
                }
            }
        ]);

        return {
            status: statusCodes.SUCCESS,
            message: messages.EXAM_LOADED_SUCCESSFULLY,
            data: {
                ...studentexams[0]
            }
        }
    }
    catch (error) {

        throw error;

    }
};

module.exports.getExamRecords = async function (req) {
    try {
        let user = req.loggedUser;
        let payload = req.query;
        let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
        let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;

        let studentexams = await Model.students.aggregate([
            {
                $match: { userID: mongoose.Types.ObjectId(user._id), isDeleted: false }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: 'user'
                }
            },
            {
                $unwind: "$user"
            },
            {
                $group: {
                    _id: "$userID",
                    studentID: { $push: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "examstudents",
                    let: {
                        studentID: "$studentID"
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $in: ["$studentID", "$$studentID"]
                                }
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
                                            examDate: {
                                                $lte: new Date(date)
                                            },
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
                            $unwind: "$exam"
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
                            $sort:{
                                "exam.createdDate":-1,
                                "exam.modifiedDate":-1
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                examID: 1,
                                studentID: 1,
                                subject: "$subject.name",
                                course: "$subject.course.name",
                                totalMarks: "$exam.totalMarks",
                                startTime: "$exam.startTime",
                                endTime: "$exam.endTime",
                                duration: "$exam.duration",
                                examDate: "$exam.examDate",
                                status:{$cond:[{$eq:["$status",APP_CONSTANTS.DURATION_STATUS.NOT_STARTED]},"NOT_ATTEMPTED","ATTEMPTED"]}
                            }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        }
                    ],
                    as: "studentexams"
                }
            },
            {
                $project: {
                    studentexams: 1,
                    _id: 0
                }
            }
        ]);

        return {
            status: statusCodes.SUCCESS,
            message: messages.EXAM_LOADED_SUCCESSFULLY,
            data: {
                ...studentexams[0]
            }
        }
    }
    catch (error) {

        throw error;

    }
};

module.exports.getResults = async function (req) {
    try {
        let user = req.loggedUser;
        let payload = req.query;
        let limit = parseInt(payload.pageSize) ? parseInt(payload.pageSize) : 5;
        let skip = parseInt(payload.pageIndex) ? parseInt(payload.pageIndex * limit) : 0;
        let results = await Model.students.aggregate([
            {
                $match: {
                    userID: user._id,
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$userID",
                    studentID: {
                        $push: "$_id"
                    }
                }
            },
            {
                $lookup: {
                    from: "results",
                    let: {
                        studentID: "$studentID"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$studentID", "$$studentID"]
                                }
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
                                    }
                                ],
                                as: "exam"
                            }
                        },
                        {
                            $sort:{
                                createdDate:-1,
                                modifiedDate:-1
                            }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
                        {
                            $unwind: "$exam"
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
                    _id:0,
                    declaredON:"$result.modifiedDate",
                    studentID: "$result.studentID",
                    examID: "$result.examID",
                    examDate: "$result.exam.examDate",
                    subject:"$result.exam.subject.name",
                    course:"$result.exam.subject.course.name",
                    marksObtained: "$result.marksObtained",
                    totalMarks: "$result.totalMarks",
                    status: "$result.status",
                    percentage: "$result.percentage",
                    grade: "$result.grade"
                }
            }
        ]);
        return {
            status: statusCodes.SUCCESS,
            message: messages.RESULTS_LOADED_SUCCESSFULLY,
            data: {
                results: results
            }
        }
    } catch (error) {
        throw error;
    }
};


module.exports.getQuestions = async function (req) {
    try {
        let payload = req.query;
        let limit = payload.pageSize ? payload.pageSize : 1;
        let skip = payload.pageIndex ? payload.pageIndex * limit : 0;

        let exam = await Model.exams.findById(payload.examID);
        let student = await Model.students.findById(payload.studentID);
        let examStudent = await Model.examstudents.findOne({ examID: payload.examID, studentID: payload.studentID, status: APP_CONSTANTS.DURATION_STATUS.ACTIVE });
        if (!exam || exam.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.EXAM_NOT_FOUND
        }
        if (!student || student.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.STUDENT_NOT_FOUND
        }
        if (!examStudent || examStudent.isDeleted) return {
            status: statusCodes.FORBIDDEN,
            message: messages.STUDENT_NOT_ALLOWDED_TO_TAKE_EXAM
        }
        if (exam.examDate.getTime() + (exam.startTime.split(":")[0] * 3600000) + (exam.startTime.split(":")[1] * 60000) > Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ONLY_ACCESSED_ON_EXAM_TIME
        }
        if (exam.examDate.getTime() + (exam.endTime.split(":")[0] * 3600000) + (exam.endTime.split(":")[1] * 60000) < Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ALREADY_COMPLETED
        }

        let count = await Model.questions.countDocuments({
            examID: exam._id,
            isDeleted: false
        });

        let question = await Model.questions.find({ examID: exam._id, isDeleted: false }, { correctOption: 0, createdDate: 0, modifiedDate: 0 }).skip(skip).limit(limit);

        return {
            status: statusCodes.SUCCESS,
            message: messages.EXAM_LOADED_SUCCESSFULLY,
            data: {
                totalPages: Math.ceil(count / limit),
                question: question
            }
        }

    } catch (error) {

        throw error;

    }
};


module.exports.accessExam = async function (req) {
    try {
        let payload = req.body;
        let exam = await Model.exams.findById(payload.examID);
        let student = await Model.students.findById(payload.studentID);
        let examStudent = await Model.examstudents.findOne({
            examID: payload.examID, studentID: payload.studentID, isDeleted: false, status: {
                $in: [APP_CONSTANTS.DURATION_STATUS.NOT_STARTED, APP_CONSTANTS.DURATION_STATUS.ACTIVE]
            }
        });
        if (!exam || exam.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.EXAM_NOT_FOUND
        }
        if (!student || student.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.STUDENT_NOT_FOUND
        }
        if (!examStudent) return {
            status: statusCodes.FORBIDDEN,
            message: messages.STUDENT_NOT_ALLOWDED_TO_TAKE_EXAM
        }

        if (payload.accessCode != exam.accessCode) return {
            status: statusCodes.FORBIDDEN,
            message: messages.INVALID_EXAM_ACCESS_CODE
        }

        if (exam.examDate.getTime() + (exam.startTime.split(":")[0] * 3600000) + (exam.startTime.split(":")[1] * 60000) > Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ONLY_ACCESSED_ON_EXAM_TIME
        }

        if (exam.examDate.getTime() + (exam.endTime.split(":")[0] * 3600000) + (exam.endTime.split(":")[1] * 60000) < Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ALREADY_COMPLETED
        }

        exam = await Model.exams.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(exam._id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectID",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: "$subject"
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "subject.courseID",
                    foreignField: "_id",
                    as: "course"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $project: {
                    _id: 0,
                    examID: "$_id",
                    course: "$course.name",
                    subject: "$subject.name",
                    startTime: "$startTime",
                    endTime: "$endTime",
                    totalMarks: "$totalMarks",
                    passingMarks: "$passingMarks",
                    examDate: "$examDate",
                    duration: "$duration"
                }
            }
        ]);

        await Model.examstudents.updateOne({ _id: examStudent._id }, { status: APP_CONSTANTS.DURATION_STATUS.ACTIVE }, { upsert: false });

        return {
            status: statusCodes.SUCCESS,
            message: messages.EXAM_LOADED_SUCCESSFULLY,
            data: {
                studentID: student._id,
                exam: exam[0]
            }
        }
    } catch (error) {

        throw error;

    }
};


module.exports.submitAnswer = async function (req) {
    try {

        let payload = req.body;
        let question = await Model.questions.findById(payload.questionID);
        let studentexam = await Model.examstudents.findOne({ examID: question.examID, studentID: payload.studentID, status: APP_CONSTANTS.DURATION_STATUS.ACTIVE });
        let exam = await Model.exams.findById(question.examID);
        let student = await Model.students.findById(payload.studentID);

        if (!exam || exam.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.EXAM_NOT_FOUND
        }
        if (exam.examDate.getTime() + (exam.startTime.split(":")[0] * 3600000) + (exam.startTime.split(":")[1] * 60000) > Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ONLY_ACCESSED_ON_EXAM_TIME
        }
        if (exam.examDate.getTime() + (exam.endTime.split(":")[0] * 3600000) + (exam.endTime.split(":")[1] * 60000) < Date.now() + (5 * 3600000 + 1800000)) return {
            status: statusCodes.FORBIDDEN,
            message: messages.EXAM_ALREADY_COMPLETED
        }
        if (!student || student.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.STUDENT_NOT_FOUND
        }
        if (!question || question.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.QUESTION_NOT_FOUND
        }
        if (!studentexam || studentexam.isDeleted) {
            return {
                status: statusCodes.FORBIDDEN,
                message: messages.STUDENT_NOT_ALLOWDED_TO_TAKE_EXAM
            }
        }

        payload.correct = question.correctOption == payload.answer ? true : false;
        let answer = await Model.answers.findOneAndUpdate({ questionID: question._id }, payload, { upsert: true, new: true });

        return {
            status: statusCodes.SUCCESS,
            message: messages.ANSWER_REGISTERED_SUCCESSFULLY,
            data: {
                answer: answer
            }
        }
    }
    catch (error) {
        throw error;
    }
};

module.exports.submitExam = async function (req) {
    try {
        let payload = req.body;
        let student = await Model.students.findById(payload.studentID);
        let exam = await Model.exams.findById(payload.examID);
        let studentexam = await Model.examstudents.findOne({ examID: payload.examID, studentID: payload.studentID, status: APP_CONSTANTS.DURATION_STATUS.ACTIVE });
        if (!exam || exam.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.EXAM_NOT_FOUND
        }
        if (!student || student.isDeleted) return {
            status: statusCodes.NOT_FOUND,
            message: messages.STUDENT_NOT_FOUND
        }
        if (!studentexam || studentexam.isDeleted) {
            return {
                status: statusCodes.FORBIDDEN,
                message: messages.STUDENT_NOT_ALLOWDED_TO_TAKE_EXAM
            }
        }
        let submit = await Model.examstudents.updateOne(studentexam, { status: APP_CONSTANTS.DURATION_STATUS.OVER }, { upsert: false, new: false });
        return {
            status: statusCodes.SUCCESS,
            message: messages.EXAM_REGISTERED_SUCCESSFULLY,
            data: {
                exam: submit
            }
        }
    } catch (error) {

        throw error;

    }
};