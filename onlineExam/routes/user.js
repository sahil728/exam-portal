const router = require("express").Router();
const {validate } = require('../middlewares');
const {user} = require('../controllers');
const {userRegistrationSchema,userLoginSchema,profileUpdateSchema} = require('../validations/user.js');

router.post('/register',validate(userRegistrationSchema),user.register);
router.post('/login',validate(userLoginSchema),user.login)

module.exports = router;