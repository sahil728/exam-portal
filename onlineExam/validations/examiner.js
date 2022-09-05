const joi = require('joi');
const  APP_CONSTANTS = require('../constant/App_Constant')
const [date,] = new Date(Date.now() + (5 * 3600000 + 1800000)).toISOString().split('T');


module.exports.createCourseSchema = {
    body:joi.object({
        name:joi.string().required().max(12).uppercase().error(()=>Error('course Name Is Not Valid')),
        description: joi.string().required().error(() => Error('Course Description Is Not Valid'))
    })
};

module.exports.addSubjectSchema ={
    body:joi.object({
        subjects: joi.array().items(
            joi.object({
                name: joi.string().required().uppercase().error(() => Error('Subject Name Is Not Valid')),
                courseID: joi.string().hex().length(24).required()

            })
        )
    })
};

module.exports.getSubjectsSchema = {

    query: joi.object({
        pageIndex: joi.number().optional(),
        pageSize: joi.number().optional(),
        courseID: joi.string().hex().length(24).required()
    })
};


const genders = [
    APP_CONSTANTS.STUDENT_GENDER.MALE,
    APP_CONSTANTS.STUDENT_GENDER.FEMALE,
    APP_CONSTANTS.STUDENT_GENDER.OTHER
]

module.exports.createStudentSchema={
    body: joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().optional(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        mobileNumber: joi.string().min(10).max(12).required(),
        password: joi.string().min(6).required(),
        courseID: joi.string().hex().length(24).required(),
        fatherName: joi.string().required(),
        motherName: joi.string().required(),
        dob: joi.date().less(new Date(date)).required(),
        city: joi.string().required(),
        state: joi.string().required(),
        address: joi.string().required(),
        gender: joi.string().valid(...genders).required()
    })
};

module.exports.addStudentSchema ={
    body:joi.object({
        studentID:joi.string().hex().length(24).required(),
        courseID:joi.string().hex().length(24).required()
    })  
};

module.exports.createExamSchema = {
    body:joi.object({
        subjectID: joi.string().hex().length(24).required(),
        startTime: joi.string().trim().required(),
        endTime: joi.string().trim().required(),
        examDate: joi.date().required(),
        duration: joi.string().trim().required(),
        accessCode: joi.string().trim().required(),
        questions: joi.array().items(
            joi.object({
                question: joi.string().required().trim(),
                options: joi.array().items(joi.string().required().trim()),
                correctOption: joi.string().required().trim(),
                marks: joi.number().required()
            }).required()).required(),
        students: joi.array().items(joi.string().hex().length(24).required().error(() => Error('StudentsID Is Not Valid'))).required()
    })
};

module.exports.removeStudentSchema={
    body:joi.object({
        studentID: joi.string().hex().length(24).required(),
        examID: joi.string().hex().length(24).required()
    })
};
   

module.exports.getStudentsSchema ={
    query:joi.object({
        pageIndex: joi.number().optional(),
        pageSize: joi.number().optional(),
        courseID: joi.string().hex().length(24).required()
    })
};

module.exports.updateCourseSchema ={
    body:joi.object({
        courseID: joi.string().hex().length(24).required(),
        name: joi.string().max(12).uppercase().optional(),
        description: joi.string().optional()
    })
};

module.exports.deleteSchema = {
    params: joi.object({
        questionID: joi.string().hex().length(24).optional(),
        studentID: joi.string().hex().length(24).optional(),
        examID: joi.string().hex().length(24).optional(),
        courseID: joi.string().hex().length(24).optional(),
        subjectID: joi.string().hex().length(24).optional()
    })
};


module.exports.updateSubjectSchema = {
    body:joi.object({
        subjectID: joi.string().hex().length(24).required(),
        name: joi.string().uppercase().optional()
    })
};

module.exports.updateExamSchema = {
    body:joi.object({
        examID: joi.string().hex().length(24).required(),
        startTime: joi.string().trim().optional(),
        endTime: joi.string().trim().optional(),
        examDate: joi.date().optional(),
        duration: joi.string().trim().optional()
    })
};

module.exports.updateQuestionSchema = {
    body: joi.object({
        questionID: joi.string().hex().length(24).required(),
        question: joi.string().trim().optional(),
        options: joi.array().items(joi.string().trim().required()).optional(),
        correctOption: joi.string().trim().optional(),
        marks: joi.number().optional()
    })
};


module.exports.resultSchema = {
    body: joi.object({
        examID: joi.string().hex().length(24).optional()
    })
};