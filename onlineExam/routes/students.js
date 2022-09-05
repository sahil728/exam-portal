const router = require('express').Router();
const {student} = require('../controllers');
const {ACCOUNT_TYPE} = require('../constant/App_Constant');
const {authorize,validate} = require('../middlewares');
const {getQuestionSchema,accessExamSchema,answerSchema,submitExamSchema} = require('../validations/student.js');


router.get('/dashboard',authorize(ACCOUNT_TYPE.STUDENT),student.getDashboard);
router.get('/exams',authorize(ACCOUNT_TYPE.STUDENT),student.getExams);
router.get('/examRecords',authorize(ACCOUNT_TYPE.STUDENT),student.getExamRecords);
router.get('/results',authorize(ACCOUNT_TYPE.STUDENT),student.getResult);
router.get('/questions',authorize(ACCOUNT_TYPE.STUDENT),validate(getQuestionSchema),student.getQuestions);
router.post('/accessExam',authorize(ACCOUNT_TYPE.STUDENT),validate(accessExamSchema),student.accessExam);
router.post('/answer',authorize(ACCOUNT_TYPE.STUDENT),validate(answerSchema),student.submitAnswer);
router.post('/exam',authorize(ACCOUNT_TYPE.STUDENT),validate(submitExamSchema),student.submitExam)



module.exports = router;
