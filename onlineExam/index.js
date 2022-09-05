const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const swaggerUI =  require('swagger-ui-express');


dotenv.config({path:'./.env'});
const config = require('./config/config.js');
const connection = require('./db/connection');
const Routes = require('./routes')
const swaggerJson = require('../swagger.json')


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/docx',swaggerUI.serve,swaggerUI.setup(swaggerJson))
app.use('/user', Routes.user);
app.use('/admin', Routes.admin);
app.use('/examiner',Routes.examiner);
app.use('/student',Routes.student)


connection.connect().then((connected) => {
app.listen(config.PORT ,(err)=>{
    if(err) throw err;
    else console.log(`app is running at port ${config.PORT || 8000} `);
})
console.log(connected);
}).catch((error)=>{
    console.log("Database Connection Error:",error);
});


