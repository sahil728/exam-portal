const router = require("express").Router()
const{admin,user} = require('../controllers');
const {ACCOUNT_TYPE} = require('../constant/App_Constant.js');
const {actionSchema,getExaminerSchema,deleteSchema} = require('../validations/admin');
const {validate,authorize} = require('../middlewares');
const {profileUpdateSchema} = require('../validations/user');


router.get('/dashboard', authorize(ACCOUNT_TYPE.ADMIN), admin.getDashboard);
router.get('/examiners',authorize(ACCOUNT_TYPE.ADMIN),validate(getExaminerSchema),admin.getExaminers);
router.patch('/profile',authorize(ACCOUNT_TYPE.ADMIN),validate(profileUpdateSchema),user.updateProfile);
router.put('/examiner',authorize(ACCOUNT_TYPE.ADMIN),validate(actionSchema), admin.approveOrDeclineExaminer);
router.delete('/examiner/:examinerID', authorize(ACCOUNT_TYPE.ADMIN), validate(deleteSchema), admin.deleteExaminer);


module.exports = router;