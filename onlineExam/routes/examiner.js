const router = require('express').Router();
const{user,examiner} = require('../controllers');
const {ACCOUNT_TYPE} =require('../constant/App_Constant.js');
const {validate,authorize} = require('../middlewares');
const {profileUpdateSchema} = require('../validations/user.js')
const {createCourseSchema,removeStudentSchema,resultSchema,updateQuestionSchema, updateExamSchema, updateCourseSchema, updateSubjectSchema, deleteSchema, getStudentsSchema,addSubjectSchema,getSubjectsSchema,createStudentSchema,addStudentSchema,createExamSchema} = require('../validations/examiner.js');

router.patch('/profile',authorize(ACCOUNT_TYPE.EXAMINER),validate(profileUpdateSchema),user.updateProfile);
router.get('/dashboard',authorize(ACCOUNT_TYPE.EXAMINER),examiner.getDashboard);
router.post('/createCourse',authorize(ACCOUNT_TYPE.EXAMINER),validate(createCourseSchema),examiner.createCourse);
router.patch('/course',authorize(ACCOUNT_TYPE.EXAMINER),validate(updateCourseSchema),examiner.updateCourse)
router.delete('/course/:courseID',authorize(ACCOUNT_TYPE.EXAMINER),validate(deleteSchema),examiner.deleteCourse)
router.get('/courseStudents',authorize(ACCOUNT_TYPE.EXAMINER),validate(getStudentsSchema),examiner.getStudents)
router.post('/addSubjects',authorize(ACCOUNT_TYPE.EXAMINER),validate(addSubjectSchema),examiner.addSubjects)
router.get('/courseSubjects',authorize(ACCOUNT_TYPE.EXAMINER),validate(getSubjectsSchema),examiner.getSubjects)
router.patch('/subject',authorize(ACCOUNT_TYPE.EXAMINER),validate(updateSubjectSchema),examiner.updateSubject)
router.delete('/subject/:subjectID',authorize(ACCOUNT_TYPE.EXAMINER),validate(deleteSchema),examiner.deleteSubject)
router.post('/createStudent',authorize(ACCOUNT_TYPE.EXAMINER),validate(createStudentSchema),examiner.createStudent)
router.post('/addStudent',authorize(ACCOUNT_TYPE.EXAMINER),validate(addStudentSchema),examiner.addStudent)
router.get('/allStudents',authorize(ACCOUNT_TYPE.EXAMINER),examiner.allStudents)
router.delete('/student/:studentID',authorize(ACCOUNT_TYPE.EXAMINER),validate(deleteSchema),examiner.deleteStudent)
router.post('/createExam',authorize(ACCOUNT_TYPE.EXAMINER),validate(createExamSchema),examiner.createExam)
router.get('/exams',authorize(ACCOUNT_TYPE.EXAMINER),examiner.getExams)
router.patch('/exam',authorize(ACCOUNT_TYPE.EXAMINER),validate(updateExamSchema),examiner.updateExam)
router.delete('exam/:examID',authorize(ACCOUNT_TYPE.EXAMINER),validate(deleteSchema),examiner.deleteExam)
router.patch('/question',authorize(ACCOUNT_TYPE.EXAMINER),validate(updateQuestionSchema),examiner.updateQuestion)
router.post('/removeStudent',authorize(ACCOUNT_TYPE.EXAMINER),validate(removeStudentSchema),examiner.removeExamStudent)
router.post('/result',authorize(ACCOUNT_TYPE.EXAMINER),validate(resultSchema),examiner.declareResult)
router.get('/result',authorize(ACCOUNT_TYPE.EXAMINER),examiner.getResult)


module.exports = router;